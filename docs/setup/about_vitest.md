
# About vitest

- [About vitest](#about-vitest)
- [Running tests](#running-tests)
- [Vitest UI port configuration](#vitest-ui-port-configuration)
- [React testing library](#react-testing-library)
  - [Querying elements by roles and labels](#querying-elements-by-roles-and-labels)
- [Notes](#notes)
- [Initial Vitest setup](#initial-vitest-setup)
  - [Configuration](#configuration)
  - [Example test file](#example-test-file)
- [Troubleshooting](#troubleshooting)
  - [TypeError: Unknown file extension ".css" for](#typeerror-unknown-file-extension-css-for)

# Running tests

```powershell
npm run test:ui
```

See also the other variants in [`package.json`](../web/package.json).

# Vitest UI port configuration

By default, Vitest UI tries to use port 51204 for its API server. On some systems, this port may be reserved or restricted,
causing errors like `EACCES: permission denied ::1:51204`.

To avoid this, specify a different port (e.g., 6174) using the `--api.port` option:

```powershell
vitest --ui --api.port=6174
```

Or update your `package.json` script:

```jsonc
"test:ui": "vitest --ui --api.port=6174"
```

This ensures Vitest UI starts on a port that is less likely to be restricted.

# React testing library

Vitest uses [React Testing Library] under the hood.

Reference:

- [Querying priority]
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby

## Querying elements by roles and labels

Per the React Testing Library [Querying priority], elements should be ideally queried by their role with
e.g. `screen.getByRole('button', { name: 'add agents' })` and as a secondary approach by label like
e.g. `screen.getByLabelText('Add agents')`.

These concepts are not trivial. Default HTML element roles are defined at:
  https://www.w3.org/TR/html-aria/#docconformance

Some elements do not have roles, like `<div>` or `<span>`.

In such cases querying should be done by label text:
  https://testing-library.com/docs/queries/bylabeltext

Which relies on the concept of accessible label to match find the labelled element:
  https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name
  https://www.tpgi.com/what-is-an-accessible-name/

Notably the label can be defined with `for` attribute of `<label>`:
  https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label

or `aria-labelledby` attribute of the element:
  https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby

or `aria-label` attribute of the element:
  https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label
  
# Notes

- Vitest is recommended for Vite + React projects.
- @testing-library/react is used for rendering and interacting with React components.
- @testing-library/jest-dom provides custom matchers for assertions.
- @testing-library/user-event simulates user interactions.
- jsdom provides a browser-like environment for tests.

If the app imports static assets (like images), it may need mocking of them or adjust imports for testing.

# Initial Vitest setup

```powershell
cd web

# Install Vitest and React Testing Library
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Install type definitions for TypeScript
npm install --save-dev @types/testing-library__react @types/testing-library__jest-dom @types/testing-library__user-event

# Install Vitest UI for a better test experience: https://vitest.dev/guide/ui
npm install --save-dev @vitest/ui
```

Then add appropriate `test` scripts to your `package.json`.

## Configuration

Add [`web/vitest.config.ts`](/web/vitest.config.ts).

Create `test/setupTests.ts`:

```ts
import '@testing-library/jest-dom'
```

## Example test file

Create `test/App.test.tsx`:

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

# Troubleshooting

## TypeError: Unknown file extension ".css" for

- https://stackoverflow.com/questions/79592526/testing-error-after-upgrading-mui-x-data-grid-to-v8-1-0-unknown-file-extensio
- https://vitest.dev/config/#server-deps-inline

Solution: add the following to `web/vitest.config.ts`:

```ts
export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['@mui/x-data-grid'],
      },
    },
  },
})
```

[Querying priority]: https://testing-library.com/docs/queries/about/#priority
[React Testing Library]: https://testing-library.com/docs/react-testing-library/intro/
