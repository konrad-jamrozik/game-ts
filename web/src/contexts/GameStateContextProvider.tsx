import { type ReactNode, use, createContext, useMemo } from 'react'
import { useGameStateLegacy, type GameState, type GameStateAction } from '../model/GameState'

type GameStateContextType = {
  state: GameState
  dispatch: React.Dispatch<GameStateAction>
}

export const GameStateContext = createContext<GameStateContextType>(undefined!)

export function useGameStateContext(): GameStateContextType {
  const ctx = use(GameStateContext)
  return ctx
}

type GameProviderProps = {
  readonly children: ReactNode
}

export function GameStateContextProvider(props: GameProviderProps): React.JSX.Element {
  const [state, dispatch] = useGameStateLegacy()
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  return <GameStateContext value={value}>{props.children}</GameStateContext>
}
