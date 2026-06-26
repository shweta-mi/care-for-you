import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Firestore is an optional, lazy-loaded cloud chunk and does not affect the
    // local-first initial bundle.
    chunkSizeWarningLimit: 650,
  },
})
