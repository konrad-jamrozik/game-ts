import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Note: the defineConfig should provide IntelliSense, per
// https://vite.dev/config/#config-intellisense
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react()],
})
