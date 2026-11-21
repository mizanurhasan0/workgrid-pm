import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Env files live in ./config (see config/.env.example). Mode "dev" loads .env.dev.local,
// mode "prod" loads .env.prod.local. Only VITE_* variables reach the bundle.
export default defineConfig({
  envDir: 'config',
  plugins: [react(), tailwindcss()],
  build: {
    // The backend serves ../clickdown-new-back/client, populated from this folder by build-prod.
    outDir: 'build',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
  },
});
