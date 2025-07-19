# About Redux and Redux Toolkit (RTK)

# Initial Redux Toolkit setup

From https://redux-toolkit.js.org/tutorials/quick-start

```powershell
npm install @reduxjs/toolkit react-redux
```

There is no plugin for eslint to configure. Notably, I did not use
https://github.com/DianaSuvorova/eslint-plugin-react-redux#readme

as it appears to be outdated:

- It has rules for `connect` which are pre-hooks.
- The README only mentions legacy eslint config, not flat config.

# Important docs from research

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
