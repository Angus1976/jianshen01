import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const adminBase =
  process.env.VITE_ADMIN_BASE_URL || (process.env.NODE_ENV === 'production' ? '/admin/' : '/');

export default defineConfig({
  base: adminBase,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#FF6B35',
        },
      },
    },
  },
});
