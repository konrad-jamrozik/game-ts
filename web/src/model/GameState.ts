/* eslint-disable @typescript-eslint/max-params */
import { useState } from 'react'

export class GameState {
  public turn: number
  public setTurn: React.Dispatch<React.SetStateAction<number>>
  public agents: number
  public setAgents: React.Dispatch<React.SetStateAction<number>>
  public money: number
  public setMoney: React.Dispatch<React.SetStateAction<number>>

  public constructor(
    turn: number,
    setTurn: React.Dispatch<React.SetStateAction<number>>,
    agents: number,
    setAgents: React.Dispatch<React.SetStateAction<number>>,
    money: number,
    setMoney: React.Dispatch<React.SetStateAction<number>>,
  ) {
    this.turn = turn
    this.setTurn = setTurn
    this.agents = agents
    this.setAgents = setAgents
    this.money = money
    this.setMoney = setMoney
  }
}

export function useGameState(): GameState {
  const [turn, setTurn] = useState(0)
  const [agents, setAgents] = useState(0)
  const [money, setMoney] = useState(100)
  return new GameState(turn, setTurn, agents, setAgents, money, setMoney)
}
