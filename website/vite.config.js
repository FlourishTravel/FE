import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/FE/', // Khớp với URL: flourishtravel.github.io/FE/
  plugins: [
    react(),
    tailwindcss(),
  ],
})
