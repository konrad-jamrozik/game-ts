import { type ReactNode, use, createContext, useMemo } from 'react'
import { useFooState, type FooState, type FooStateAction } from '../model/FooState'

type FooStateContextType = {
  state: FooState
  dispatch: React.Dispatch<FooStateAction>
}

export const FooStateContext = createContext<FooStateContextType>(undefined!)

export function useFooStateContext(): FooStateContextType {
  const ctx = use(FooStateContext)
  return ctx
}

type FooStateContextProviderProps = {
  readonly children: ReactNode
}

export function FooStateContextProvider(props: FooStateContextProviderProps): React.JSX.Element {
  const [state, dispatch] = useFooState()
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  return <FooStateContext value={value}>{props.children}</FooStateContext>
}
