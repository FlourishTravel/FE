import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/FlourishTravel/', // Đổi nếu tên repo GitHub khác
  plugins: [
    react(),
    tailwindcss(),
  ],
})
