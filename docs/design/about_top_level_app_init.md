# About top-level app initialization (bootstrap)

This document explains how the app bootstraps - what are the first files loaded, entry points.

# The app bootstrap process order

The bootstrap process happens in this order:

``` text
index.html imports -> main.tsx
main.tsx:
  imports -> App, store, theme
  renders -> App
  injects into App -> store, theme
App:
  renders -> All the components
```

# The app bootstrap process in a bit more detail

First, the app loads the `index.html` file.

Then via this:

`<script type="module" src="/src/main.tsx"></script>`

the app loads the `main.tsx` file.

The `main.tsx` file does this:

``` tsx
import App from './redux/App.tsx'
import { store } from './redux/store'
import theme from './styling/theme.tsx'

const rootElement = document.querySelector('#root')
if (rootElement) {
  createRoot(rootElement).render(
        <ThemeProvider theme={theme} defaultMode="dark">
            <Provider store={store}>
              <App />
            </Provider>
        </ThemeProvider>
  )
```

which makes React inject `App` into the `#root` DOM element, and it injects into `theme` and `store` into the `App` component.

Then, the app loads the `main.tsx` file.
Then, the app loads the `App.tsx` file.
Then, the app loads the `store.ts` file.
Then, the app loads the `persist.ts` file.
Then, the app loads the `theme.tsx` file.
Then, the app loads the `ErrorBoundary.tsx` file.
Then, the app loads the `Error.tsx` file.
Then, the app loads the `ErrorBoundary.tsx` file.
