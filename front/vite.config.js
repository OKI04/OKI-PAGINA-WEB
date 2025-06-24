import { defineConfig } from 'vite';
import { VitePluginStaticCopy } from 'vite-plugin-static-copy';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';
import VitePluginMultiPage from 'vite-plugin-multi-page';

export default defineConfig({
  base: './',
  plugins: [
    VitePluginMultiPage()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'views/dashboardAdmin.html')
      }
    },
    outDir: 'dist',
  },
});
