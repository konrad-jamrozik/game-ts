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
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.test*'],
          environment: 'node',
          globals: true,
          setupFiles: ['./test/utils/setupAllTests.ts'],
          testTimeout: 30_000,
        },
      },
      {
        extends: true, // Inherit plugins from root config
        test: {
          name: 'component',
          include: ['test/component/*.test*'],
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./test/utils/setupAllTests.ts', './test/utils/setupReactTests.ts'],
          testTimeout: 30_000,
          server: {
            deps: {
              // Refer to docs/setup/about_vitest.md troubleshooting section for more details.
              inline: ['@mui/x-data-grid'],
            },
          },
        },
      },
      {
        extends: true, // Inherit plugins from root config
        test: {
          name: 'e2e',
          include: ['test/e2e/*.test*'],
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./test/utils/setupAllTests.ts', './test/utils/setupReactTests.ts'],
          testTimeout: 60_000, // Longer timeout for E2E tests
          server: {
            deps: {
              // Refer to docs/setup/about_vitest.md troubleshooting section for more details.
              inline: ['@mui/x-data-grid'],
            },
          },
        },
      },
      {
        test: {
          name: 'ai',
          include: ['test/ai/*.test*'],
          environment: 'node',
          globals: true,
          setupFiles: ['./test/utils/setupAllTests.ts'],
          testTimeout: 60_000, // Longer timeout for AI tests
        },
      },
    ],
  },
})
