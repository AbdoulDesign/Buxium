import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      }
    }
  },
  define: {
    'process.env': {}
  }
})