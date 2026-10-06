import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  oxc: {
    target: 'es2020',
    jsx: { runtime: 'automatic' },
  },
  build: {
    sourcemap: mode === 'development',
  },
  server: {
    port: 5274,
  },
}));
