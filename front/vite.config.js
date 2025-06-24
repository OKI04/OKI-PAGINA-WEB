import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'src/views/dashboardAdmin.html')
      }
    },
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/admin': {
        target: 'https://backend-oki-web.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
