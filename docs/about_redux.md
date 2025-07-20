# About Redux and Redux Toolkit (RTK)

# Initial Redux Toolkit setup

## Setup package

From https://redux-toolkit.js.org/tutorials/quick-start

```powershell
npm install @reduxjs/toolkit react-redux
```

## Setup eslint

There is no plugin for eslint to configure. Notably, I did not use
https://github.com/DianaSuvorova/eslint-plugin-react-redux#readme

as it appears to be outdated:

- It has rules for `connect` which are [pre-hooks][connect].
- The README only mentions legacy eslint config, not flat config.

## Setup Redux devtools

Install in Chrome, per:
https://github.com/reduxjs/redux-devtools/tree/main/extension#installation

Then use it in Dev tools. That's it!

## Setup TypeScript, testing best practices

🚧KJA WIP Next, set it up to work with TypeScript per:

- https://redux-toolkit.js.org/tutorials/typescript

- https://redux.js.org/usage/#code-quality
  - https://redux.js.org/usage/writing-tests
    - Note: the Redux DevTools Chrome extensions has a feature to generate tests snippet from current state.
  - https://redux.js.org/usage/usage-with-typescript
    - Notably eslint setup: https://redux.js.org/usage/usage-with-typescript#use-typed-hooks-in-components

- https://redux.js.org/usage/deriving-data-selectors#balance-selector-usage

# Docs

- https://redux-toolkit.js.org/introduction/getting-started
- https://redux.js.org/introduction/getting-started
- https://react-redux.js.org/introduction/getting-started
- https://github.com/reduxjs/redux-templates/tree/master/packages/vite-template-redux

- Mentions of React Profiler:
  https://redux.js.org/tutorials/essentials/part-6-performance-normalization#investigating-the-posts-list

- useSelector subscribes
  https://react-redux.js.org/api/hooks#useselector

# Caveats

## Randomness goes into action creators, not reducers. Use `prepare` callback

- https://redux.js.org/tutorials/essentials/part-4-using-data#preparing-action-payloads
- https://redux-toolkit.js.org/api/createSlice#customizing-generated-action-creators
- https://redux-toolkit.js.org/api/createAction#using-prepare-callbacks-to-customize-action-contents

## Using selectors effectively

- https://redux.js.org/tutorials/essentials/part-4-using-data#using-selectors-effectively

# Performance

- https://redux.js.org/tutorials/essentials/part-6-performance-normalization#improving-render-performance

## Double dispatch and avoiding rerenders

In React 18+ calling `dispatch` multiple times in a row will still result in one render,
per this note:
https://react-redux.js.org/api/batch

See also:

- https://redux.js.org/style-guide/#avoid-dispatching-many-actions-sequentially
- Cannot call dispatch from reducer:
https://redux.js.org/api/store#dispatchaction
- https://redux.js.org/usage/writing-logic-thunks

# Research

Probably want to use Redux Toolkit (RTK), instead of React simple useReducer.

Some good articles:
https://redux-toolkit.js.org/introduction/why-rtk-is-redux-today

https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367
from https://redux.js.org/tutorials/essentials/part-1-overview-concepts

https://redux.js.org/understanding/history-and-design/history-of-redux

Dir layout:
https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic

Ducks pattern:
https://github.com/erikras/ducks-modular-redux
from https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic

Thunk name origin:
https://github.com/tj/co#thunks and https://en.wikipedia.org/wiki/Thunk
from https://github.com/reduxjs/redux/pull/195#discussion_r33650328
from "combineReducers" link in https://gist.github.com/markerikson/2971210292a9c65138eeb33ae7d560b0
from https://redux.js.org/understanding/history-and-design/history-of-redux#further-information

https://www.linkedin.com/pulse/advanced-global-state-management-reactjs-best-patterns-valmy-machado-qxtwf/
from deep research: https://chatgpt.com/c/6878bf09-36b0-8011-b9aa-72dbefcc6261
Shorter version: https://chatgpt.com/c/6878bf81-8c0c-8011-b9e9-3bc725236982

## React's useReducer

For built-in react's useReducer see:
https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks/#usereducer

[connect]: https://react-redux.js.org/api/connect
