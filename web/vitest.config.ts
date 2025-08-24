import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
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
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    // With exclude: ['test/App.test.tsx']:
    //   1.33s (transform 385ms, setup 763ms, collect 1.97s, tests 125ms, environment 3.23s, prepare 691ms)
    // Without exclude: ['test/App.test.tsx']:
    //   9.93s (transform 1.72s, setup 936ms, collect 9.60s, tests 1.49s, environment 3.83s, prepare 894ms)
    // Conditionally exclude App.test.tsx based on RUN_ALL_TESTS environment variable
    exclude: process.env['RUN_ALL_TESTS'] !== undefined ? [] : ['test/App.test.tsx'],
    // https://github.com/jsdom/jsdom
    // https://testing-library.com/docs/react-testing-library/setup#using-without-jest
    environment: 'jsdom',
    globals: true,
    server: {
      deps: {
        // Refer to docs/setup/about_vitest.md troubleshooting section for more details.
        inline: ['@mui/x-data-grid'],
      },
    },
    setupFiles: './test/setupTests.ts',
    testTimeout: 30_000,
  },
})
