import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook('onRequest', async (request, reply) => {
    const incoming = request.headers['x-request-id'];
    const requestId = typeof incoming === 'string' && /^[a-zA-Z0-9._:-]{8,100}$/.test(incoming) ? incoming : randomUUID();
    request.headers['x-request-id'] = requestId;
    reply.header('x-request-id', requestId);
  });
  fastify.addHook('onResponse', async (request, reply) => {
    const requestId = String(request.headers['x-request-id'] ?? request.id);
    console.info(JSON.stringify({ level: 'info', event: 'http.request.completed', requestId, method: request.method, route: request.routeOptions.url, statusCode: reply.statusCode, responseTimeMs: Math.round(reply.elapsedTime) }));
  });
  fastify.addHook('onError', async (request, reply, error) => {
    const requestId = String(request.headers['x-request-id'] ?? request.id);
    console.error(JSON.stringify({ level: 'error', event: 'http.request.failed', requestId, method: request.method, route: request.routeOptions.url, statusCode: reply.statusCode, errorName: error.name, errorMessage: error.message }));
  });

  await app.register(helmet);
  const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 }) : undefined;
  if (process.env.NODE_ENV === 'production' && !redis) throw new Error('REDIS_URL wajib dikonfigurasi untuk production');
  if (redis) {
    await redis.connect();
    fastify.addHook('onClose', async () => { await redis.quit(); });
  }
  await app.register(rateLimit, {
    global: true,
    max: Number(process.env.RATE_LIMIT_MAX ?? 300),
    timeWindow: process.env.RATE_LIMIT_WINDOW ?? '1 minute',
    ban: 3,
    cache: 20_000,
    redis,
    allowList: (request) => request.method === 'OPTIONS',
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Terlalu banyak permintaan. Coba kembali dalam ${Math.ceil(context.ttl / 1000)} detik.`,
    }),
  });
  await app.register(multipart, { limits: { files: 1, fileSize: 5 * 1024 * 1024, fields: 5 } });
  const allowedOrigins = (process.env.CORS_ORIGINS ?? process.env.NEXT_PUBLIC_SITE_URL ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
  if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error('CORS_ORIGINS wajib dikonfigurasi untuk production');
  }
  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : [/^http:\/\/localhost:\\d+$/],
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Batam Travelling ERP API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_DOCS === 'true') {
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  }

  return app;
}
