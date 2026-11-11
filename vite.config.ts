import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function copilotDevApi(): Plugin {
  return {
    name: 'flamelens-copilot-dev-api',
    configureServer(server) {
      let handlerPromise: Promise<(request: unknown, response: unknown) => Promise<unknown>> | null = null;
      server.middlewares.use('/api/copilot', async (request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'POST' && request.method !== 'OPTIONS') return next();
        try {
          let body: unknown;
          if (request.method === 'POST') {
            const parts: Buffer[] = [];
            let size = 0;
            for await (const part of request) {
              const buffer = Buffer.isBuffer(part) ? part : Buffer.from(part);
              size += buffer.length;
              if (size > 7000) {
                response.statusCode = 413;
                response.setHeader('Content-Type', 'application/json; charset=utf-8');
                response.end(JSON.stringify({ error: 'Question is too large.' }));
                return;
              }
              parts.push(buffer);
            }
            const rawBody = Buffer.concat(parts).toString('utf8');
            body = rawBody ? JSON.parse(rawBody) : {};
          }

          handlerPromise ||= import(pathToFileURL(path.resolve('api/copilot.js')).href)
            .then(({ default: handler }) => handler as (request: unknown, response: unknown) => Promise<unknown>);
          const handler = await handlerPromise;
          const functionResponse = {
            status(statusCode: number) { response.statusCode = statusCode; return this; },
            setHeader(name: string, value: string) { response.setHeader(name, value); return this; },
            json(value: unknown) {
              response.setHeader('Content-Type', 'application/json; charset=utf-8');
              response.end(JSON.stringify(value));
              return this;
            },
          };
          await handler(Object.assign(request, { body }), functionResponse);
        } catch {
          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ error: 'Local Copilot API request failed.' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '');
  for (const name of ['FLAMELENS_LLM_API_KEY', 'FLAMELENS_LLM_MODEL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']) {
    if (!process.env[name] && localEnv[name]) process.env[name] = localEnv[name];
  }
  return {
    plugins: [react(), copilotDevApi()],
    server: { port: 5173, host: true },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three'],
          },
        },
      },
    },
  };
});
