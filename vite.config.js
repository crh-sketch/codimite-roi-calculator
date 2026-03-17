import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Change 'codimite-roi-calculator' to your GitHub repo name
  base: '/codimite-roi-calculator/',
})
