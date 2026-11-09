import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Log presence, not the secret itself — config output lands in terminal history.
  const backendOrigin = env.VITE_PROXY_BACKEND_ORIGIN ?? 'http://localhost:3001';
  console.log('[vite] ADMIN_API_TOKEN present:', Boolean(env.ADMIN_API_TOKEN));
  console.log('[vite] VITE_PROXY_BACKEND_ORIGIN:', backendOrigin);

  return {
    plugins: [react()],
    legacy: {
      /* For MUI icons to work */
      inconsistentCjsInterop: true,
    },
    oxc: {
      target: 'es2020',
      jsx: { runtime: 'automatic' },
    },
    build: {
      sourcemap: mode === 'development',
    },
    server: {
      port: 5274,
      // To inject ADMIN_API_TOKEN into requests to the backend API, 
      // we use a proxy. This is necessary because the backend API is 
      // on a different origin than the frontend, and we want to 
      // avoid exposing the token in the frontend code.
      // This VITE_PROXY_BACKEND_ORIGIN environment variable should be set to 
      // the backend API's origin you use for development when other than localhost.
      proxy: {
        '/api': {
          target: `${backendOrigin}`,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              console.log(
                '[vite] proxying request to backend API, adding authorization header',proxyReq.path
              );
              if (env.ADMIN_API_TOKEN) {
                proxyReq.setHeader(
                  'authorization',
                  `Bearer ${env.ADMIN_API_TOKEN}`,
                );
              }
            });
          },
        },
      },
    },
  };
});
