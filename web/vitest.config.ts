import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { includeSlow } from './test/utils/testUtils'

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
          include: ['test/**/*.test.ts'],
          exclude: ['test/**/*.test.tsx'],
          environment: 'node',
          globals: true,
          setupFiles: './test/utils/setupTests.ts',
          testTimeout: 30_000,
        },
      },
      {
        extends: true, // Inherit plugins from root config
        test: {
          name: 'react',
          include: ['test/**/*.test.tsx'],
          exclude: includeSlow ? [] : ['test/**/App.test.tsx'],
          environment: 'jsdom',
          globals: true,
          setupFiles: './test/utils/setupTests.ts',
          testTimeout: 30_000,
          server: {
            deps: {
              // Refer to docs/setup/about_vitest.md troubleshooting section for more details.
              inline: ['@mui/x-data-grid'],
            },
          },
        },
      },
    ],
  },
})
