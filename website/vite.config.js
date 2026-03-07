import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/FE/' : '/', // '/FE/' chỉ dùng khi deploy lên GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
  ],
}))
