import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/static/react/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    outDir: '../static/react',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.jsx'),
      output: {
        entryFileNames: 'app.js',
        assetFileNames: (a) =>
            a.names?.[0]?.endsWith('.css') ? 'app.css' : 'assets/[name][extname]',
      },
    },
  },
  server: {
    proxy: {
      '/create-grid': 'http://127.0.0.1:8000',
      '/omraade': 'http://127.0.0.1:8000',
      '/trekk': 'http://127.0.0.1:8000',
    },
  },
})