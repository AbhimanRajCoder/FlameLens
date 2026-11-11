import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function copilotDevStatus(): Plugin {
  return {
    name: 'flamelens-copilot-dev-status',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url || '/', 'http://localhost');
        if (url.pathname !== '/api/copilot') return next();
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (request.method === 'GET' && url.searchParams.get('mode') === 'status') {
          response.statusCode = 200;
          response.end(JSON.stringify({ configured: false, mode: 'local-retrieval' }));
          return;
        }
        response.statusCode = 503;
        response.end(JSON.stringify({ error: 'No LLM provider is configured for the local development server.' }));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copilotDevStatus()],
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
});
