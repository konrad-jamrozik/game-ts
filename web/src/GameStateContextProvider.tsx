import { type ReactNode, createContext } from 'react'
import { useGameState, type GameState } from './GameState'

export const GameStateContext = createContext<GameState>(undefined!)

interface GameProviderProps {
  readonly children: ReactNode
}

export function GameStateContextProvider(props: GameProviderProps): React.JSX.Element {
  const gameState: GameState = useGameState()
  return <GameStateContext value={gameState}>{props.children}</GameStateContext>
}
