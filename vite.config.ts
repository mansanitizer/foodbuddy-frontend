import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3030,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    hmr: {
      port: 3030
    }
  },
  preview: {
    port: 3030,
    host: '0.0.0.0'
  }
})
