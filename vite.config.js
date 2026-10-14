import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/shiprocket': {
        target: 'https://apiv2.shiprocket.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/shiprocket/, ''),
        secure: true
      }
    }
  }
})
