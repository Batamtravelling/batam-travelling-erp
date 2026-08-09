import 'reflect-metadata';
import { createApp } from './create-app.js';

async function bootstrap() {
  const app = await createApp();
  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
}
bootstrap();
