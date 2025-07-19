import { useReducer } from 'react'

export type FooState = {
  foo: number
  bar: number
}

export type FooStateAction =
  | { type: 'setFoo'; payload: number }
  | { type: 'setBar'; payload: number }
  | { type: 'reset' }

function fooStateReducer(state: FooState, action: FooStateAction): FooState {
  switch (action.type) {
    case 'setFoo': {
      return {
        ...state,
        foo: action.payload,
      }
    }
    case 'setBar': {
      return {
        ...state,
        bar: action.payload,
      }
    }
    case 'reset': {
      return { foo: 0, bar: 0 }
    }
    default: {
      return state
    }
  }
}

export function useFooState(): [FooState, React.Dispatch<FooStateAction>] {
  return useReducer(fooStateReducer, { foo: 0, bar: 0 })
}
