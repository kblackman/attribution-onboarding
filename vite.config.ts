import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so the build works at any GitHub Pages path (kblackman.github.io/<repo>/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // two editions from one codebase: index.html (presentation) and portfolio.html (self-serve), see src/engine/edition.ts
  build: { rollupOptions: { input: { main: 'index.html', portfolio: 'portfolio.html' } } },
})
