import { useReducer } from 'react'

export type GameState = {
  turn: number
  agents: number
  money: number
}

export type GameStateAction =
  | { type: 'setTurn'; payload: number }
  | { type: 'setAgents'; payload: number }
  | { type: 'setMoney'; payload: number }
  | { type: 'reset' }

function gameStateReducer(state: GameState, action: GameStateAction): GameState {
  switch (action.type) {
    case 'setTurn': {
      return {
        ...state,
        turn: action.payload,
      }
    }
    case 'setAgents': {
      return {
        ...state,
        agents: action.payload,
      }
    }
    case 'setMoney': {
      return {
        ...state,
        money: action.payload,
      }
    }
    case 'reset': {
      return { turn: 0, agents: 0, money: 100 }
    }
    default: {
      return state
    }
  }
}

export function useGameState(): [GameState, React.Dispatch<GameStateAction>] {
  return useReducer(gameStateReducer, { turn: 0, agents: 0, money: 100 })
}
