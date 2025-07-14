import { createContext, use } from 'react'
import type { GameState } from './GameState'

export const GameStateContext = createContext<GameState>(undefined!)

export function useGameStateContext(): GameState {
  return use(GameStateContext)
}
