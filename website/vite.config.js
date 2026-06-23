import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))
const DEFAULT_API_URL = 'https://flourishtravel-rtdye.ondigitalocean.app/api'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, 'VITE_')
  const apiUrl = (env.VITE_API_URL || DEFAULT_API_URL).trim()

  return {
    root: rootDir,
    envDir: rootDir,
    base: mode === 'production' ? '/FE/' : '/',
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  }
})
