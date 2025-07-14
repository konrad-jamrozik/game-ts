import { createContext, use } from 'react'

export interface GameState {
  turn: number
  agents: number
  money: number
  setTurn: React.Dispatch<React.SetStateAction<number>>
  setAgents: React.Dispatch<React.SetStateAction<number>>
  setMoney: React.Dispatch<React.SetStateAction<number>>
}

export const GameContext = createContext<GameState | undefined>(undefined)

export function useGameContext(): GameState {
  const ctx = use(GameContext)
  if (!ctx) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return ctx
}

export const GameProvider = GameContext.Provider
