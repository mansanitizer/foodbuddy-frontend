import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3030,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    hmr: {
      port: 3030
    },
    headers: {
      // Add headers for better mobile PWA support
      'Service-Worker-Allowed': '/',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  },
  preview: {
    port: 3030,
    host: '0.0.0.0',
    headers: {
      // Add headers for better mobile PWA support
      'Service-Worker-Allowed': '/',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  },
  build: {
    // Ensure service worker is copied to dist
    rollupOptions: {
      output: {
        // Add cache busting for mobile browsers
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
