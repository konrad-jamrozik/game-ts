import type { ReactNode } from 'react'
import { useGameState, type GameState } from './GameState'
import { GameStateContext } from './GameStateContext'
interface GameProviderProps {
  readonly children: ReactNode
}

export function GameStateContextProvider(props: GameProviderProps): React.JSX.Element {
  const gameState: GameState = useGameState()
  return <GameStateContext value={gameState}>{props.children}</GameStateContext>
}
