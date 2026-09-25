import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // localhost only; `npm run dev:lan` exposes it to the network
    port: 5173
  }
})
