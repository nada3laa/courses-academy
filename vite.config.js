import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174,
    hmr: {
      port: 5174,
    },
    proxy: {
      '/api': {
        target: 'https://api.alacademeya.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})