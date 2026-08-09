import 'reflect-metadata';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../apps/api/src/create-app.js';

let appPromise: ReturnType<typeof createApp> | undefined;

function getApp(): ReturnType<typeof createApp> {
  if (!appPromise) {
    appPromise = createApp().then(async (app) => {
      await app.init();
      await app.getHttpAdapter().getInstance().ready();
      return app;
    });
  }

  return appPromise;
}

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const app = await getApp();
  app.getHttpAdapter().getInstance().server.emit('request', request, response);
}
