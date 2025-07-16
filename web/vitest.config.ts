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
    // https://github.com/jsdom/jsdom
    // https://testing-library.com/docs/react-testing-library/setup#using-without-jest
    environment: 'jsdom',
    globals: true,
    server: {
      deps: {
        // Refer to docs/about_vitest.md troubleshooting section for more details.
        inline: ['@mui/x-data-grid'],
      },
    },
    setupFiles: './test/setupTests.ts',
    testTimeout: 30_000,
  },
})
