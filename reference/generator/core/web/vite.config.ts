import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  publicDir: resolve(__dirname, '../public'),
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:5000', '/poster-assets': 'http://127.0.0.1:5000', '/fonts': 'http://127.0.0.1:5000' },
    fs: { allow: [resolve(__dirname, '..')] },
  },
})
