import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Note: the defineConfig provides IntelliSense, per
// https://vite.dev/config/#config-intellisense
/** @type {import('vite').UserConfig} */
export default defineConfig({
  base: '/game-ts/', // This is needed for GitHub Pages deployment.
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
})
