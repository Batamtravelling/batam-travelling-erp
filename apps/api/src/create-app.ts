import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import Redis from 'ioredis';

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(helmet);
  const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 }) : undefined;
  if (process.env.NODE_ENV === 'production' && !redis) throw new Error('REDIS_URL wajib dikonfigurasi untuk production');
  if (redis) {
    await redis.connect();
    app.getHttpAdapter().getInstance().addHook('onClose', async () => { await redis.quit(); });
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
