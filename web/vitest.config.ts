import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
// eslint-disable-next-line tsdoc/syntax
/** @type {import('vite').UserConfig} */
// https://vitest.dev/guide/#configuring-vitest
export default defineConfig({
  plugins: [react()],
  test: {
    chaiConfig: {
      includeStack: true, // https://vitest.dev/config/#chaiconfig-includestack
    },
    coverage: {
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setupTests.ts',
    testTimeout: 30_000,
  },
})
