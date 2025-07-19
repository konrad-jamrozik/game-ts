# About React

# Initial React 19 compiler setup

``` powershell
# https://react.dev/learn/react-compiler
npm install --save-dev babel-plugin-react-compiler@rc 
npm install --save-dev eslint-plugin-react-hooks@^6.0.0-rc.1
```

Then modified `vite.config.ts` to use the plugin per:
  https://react.dev/learn/react-compiler#usage-with-vite

And configured eslint plugin. See:

- [About ESLint](about_eslint.md#initial-eslint-config-setup).
- https://react.dev/learn/react-compiler#something-is-not-working-after-compilation

# Initial Redux Toolkit setup

From https://redux-toolkit.js.org/tutorials/quick-start

```powershell
npm install @reduxjs/toolkit react-redux
```

# Typing React - Typescript & React Cheatsheet

Main documentation are those two articles in React Typescript Cheatsheet:

- https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example
- https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components

## When to use which React Element/Node

| Type                   | Description                                    | Examples                                               |
|------------------------|------------------------------------------------|--------------------------------------------------------|
| `JSX.Element`          | Return type of a JSX component. Essentially an alias for `React.ReactElement<any, any>`. | `const MyComp = (): JSX.Element => <div />;`          |
| `React.ReactElement`   | A single React element created via JSX or `React.createElement`. | Prop expecting a single element: `icon: React.ReactElement` |
| `React.ReactNode`      | Anything React can render: elements, strings, numbers, null, arrays, etc. | `children: React.ReactNode`                           |

- ✅ Use **`JSX.Element`** for component **return types**  
- ✅ Use **`React.ReactElement`** for props that must be **a single element**  
- ✅ Use **`React.ReactNode`** when accepting **anything renderable**, e.g. `children`  

JSX.Element and React.ReactElement are mostly interchangeable.
JSX.Element is more common in return types, while React.ReactElement is a bit more explicit and flexible for props.

Relevant doc:
https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example/#useful-react-prop-type-examples

# interface vs type

https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example/#more-advice

> always use interface for public API's definition when authoring a library or 3rd party ambient type definitions,
> as this allows a consumer to extend them via declaration merging if some definitions are missing.

> consider using type for your React Component Props and State, for consistency and because it is more constrained.
