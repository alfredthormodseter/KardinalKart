import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/create-grid': 'http://127.0.0.1:8000',
      '/omraade': 'http://127.0.0.1:8000',
      '/trekk': 'http://127.0.0.1:8000',
    },
  },
})
