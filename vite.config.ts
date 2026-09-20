import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://<user>.github.io/SHIFTER_PRO/ — a project Pages
  // site lives under a subpath, so asset URLs need this base to resolve.
  base: process.env.GITHUB_ACTIONS ? "/SHIFTER_PRO/" : "/",
  server: {
    port: Number(process.env.PORT) || 5173,
  },
})
