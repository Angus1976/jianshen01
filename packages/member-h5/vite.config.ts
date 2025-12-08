import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

const baseUrl = process.env.BASE_URL ?? './';

export default defineConfig(({ mode }) => ({
  base: baseUrl,
  plugins: [uni()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env.BASE_URL': JSON.stringify(baseUrl),
  },
}));
