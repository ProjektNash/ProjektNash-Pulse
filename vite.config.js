import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ProjektNash-Pulse/', // 👈 must match your repo name exactly (case-sensitive)
})
