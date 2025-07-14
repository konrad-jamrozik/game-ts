import { use } from 'react'
import { type GameState, GameContext } from './GameContext'

export function useGameContext(): GameState {
  const ctx = use(GameContext)
  if (!ctx) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return ctx
}
