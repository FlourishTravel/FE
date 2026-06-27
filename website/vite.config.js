import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))
const DEFAULT_API_URL = 'https://flourishtravel.khanhtn45.id.vn/api'

function normalizeApiUrl(url) {
  let base = (url || DEFAULT_API_URL).trim().replace(/\/+$/, '')
  while (base.endsWith('/api/api')) {
    base = base.slice(0, -4)
  }
  return base
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, 'VITE_')
  const apiUrl = normalizeApiUrl(env.VITE_API_URL || DEFAULT_API_URL)
  const base = (env.VITE_BASE || (mode === 'production' ? '/FE/' : '/')).trim()

  return {
    root: rootDir,
    envDir: rootDir,
    base,
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  }
})
