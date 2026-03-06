import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    open: '/beta-1/',
  },
  base: '/klub-medyka-beta/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
