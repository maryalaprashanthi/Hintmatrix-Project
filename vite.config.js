import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Intercepts all paths starting with /api and routes them to Spring Boot
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Cleans the prefix before hitting Java
      }
    }
  }
})
