import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/admin': {
        target: 'https://backend-oki-web.onrender.com',  // tu backend Node
        changeOrigin: true,
        secure: false
      }
    }
  }
});
