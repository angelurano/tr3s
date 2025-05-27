import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, '../convex'),
      '@': path.resolve(__dirname, './src')
    }
  }
  /* server: {
    proxy: {
      "/api": {
        target: process.env.CONVEX_URL, // 127.0.0.1
        changeOrigin: true,
      }
    }
  } */
});
