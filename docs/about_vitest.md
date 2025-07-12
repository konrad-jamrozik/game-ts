
# About vitest

## Initial Vitest setup

```powershell
cd web

# Install Vitest and React Testing Library
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Install type definitions for TypeScript
npm install --save-dev @types/testing-library__react @types/testing-library__jest-dom @types/testing-library__user-event
```

## Configuration

Add `vitest.config.ts` in the `web/` directory:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
```

Create `src/setupTests.ts`:

```ts
import '@testing-library/jest-dom'
```

## Example test file

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('should have a button "Add agents" and respond to click', async () => {
    render(<App />)
    // Example: screen.getByRole('button', { name: /add agents/i })
    // userEvent.click(screen.getByRole('button', { name: /add agents/i }))
    // expect(await screen.findByText(/success/i)).toBeInTheDocument()
  })
})
```

## Running tests

```powershell
npx vitest run
```

## Notes

- Vitest is recommended for Vite + React projects.
- @testing-library/react is used for rendering and interacting with React components.
- @testing-library/jest-dom provides custom matchers for assertions.
- @testing-library/user-event simulates user interactions.
- jsdom provides a browser-like environment for tests.

If your app imports static assets (like images), you may need to mock them or adjust imports for testing.
