import { type ReactNode, use, createContext } from 'react'
import { useGameState, type GameState } from '../model/GameState'

export const GameStateContext = createContext<GameState>(undefined!)

export function useGameStateContext(): GameState {
  const ctx = use(GameStateContext)
  return ctx
}

interface GameProviderProps {
  readonly children: ReactNode
}

export function GameStateContextProvider(props: GameProviderProps): React.JSX.Element {
  const gameState: GameState = useGameState()
  return <GameStateContext value={gameState}>{props.children}</GameStateContext>
}
