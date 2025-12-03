import path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Main process entry file
        entry: 'electron/main.ts',
      },
      preload: {
        // Preload scripts
        input: 'electron/preload.ts',
      },
      // Optional: Use Node.js API in Renderer-process
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to backend server (for web mode)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  base: './', // Important for Electron
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Ensure external dependencies are not bundled
      external: ['electron'],
    },
  },
})
