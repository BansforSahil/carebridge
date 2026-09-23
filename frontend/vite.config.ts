import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During `npm run dev`, all /api/* requests are forwarded to Flask
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Output built files directly into the Flask static folder
    outDir: '../frontend_dist',
    emptyOutDir: true,
  },
})
