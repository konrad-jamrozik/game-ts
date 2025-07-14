# About React

# Typing react

Main documentation are those two articles in React Typescript Cheatsheet:

https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example
https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components

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
