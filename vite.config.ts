import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    writeBundle() {
      const indexHtml = fileURLToPath(new URL('./dist/index.html', import.meta.url))
      const notFoundHtml = fileURLToPath(new URL('./dist/404.html', import.meta.url))
      if (existsSync(indexHtml)) copyFileSync(indexHtml, notFoundHtml)
    },
  }
}

export default defineConfig({
  appType: 'spa',
  plugins: [react(), tailwindcss(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
