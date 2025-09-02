export type TurnReport = BaseReport & {
  assets: AssetsReport
}

export type BaseReport = {
  timestamp: number
  turn: number
}

export type AssetsReport = {
  money: ValueChange
  intel: ValueChange
  moneyDetails: MoneyBreakdown
  intelDetails: IntelBreakdown
}

export type ValueChange = {
  previous: number
  current: number
  readonly delta: number
}

export function newValueChange(previous: number, current: number): ValueChange {
  return {
    previous,
    current,
    get delta(): number {
      return this.current - this.previous
    },
  }
}

export type MoneyBreakdown = {
  agentUpkeep: number
  contractingEarnings: number
  fundingIncome: number
  hireCosts: number
  missionRewards: number
}

export type IntelBreakdown = {
  espionageGathered: number
  missionRewards: number
}
