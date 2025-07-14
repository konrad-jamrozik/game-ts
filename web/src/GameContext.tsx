import { createContext, useState, type ReactNode } from 'react'
export interface GameState {
  turn: number
  agents: number
  money: number
  setTurn: React.Dispatch<React.SetStateAction<number>>
  setAgents: React.Dispatch<React.SetStateAction<number>>
  setMoney: React.Dispatch<React.SetStateAction<number>>
}

export const GameContext = createContext<GameState | undefined>(undefined)

interface GameProviderProps {
  readonly children: ReactNode
}

export function GameProvider(props: GameProviderProps): React.JSX.Element {
  const [turn, setTurn] = useState(0)
  const [agents, setAgents] = useState(0)
  const [money, setMoney] = useState(100)
  const value: GameState = { turn, setTurn, agents, setAgents, money, setMoney }
  return <GameContext value={value}>{props.children}</GameContext>
}
