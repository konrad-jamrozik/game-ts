export type TurnReport = BaseReport & {
  assets: AssetsReport
  panic: PanicReport
  factions: FactionReport[]
}

export type BaseReport = {
  timestamp: number
  turn: number
}

export type AssetsReport = {
  moneyChange: ValueChange
  intelChange: ValueChange
  agentsReport: AgentsReport
  moneyBreakdown: MoneyBreakdown
  intelBreakdown: IntelBreakdown
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

export type AgentsReport = {
  total: ValueChange
  available: ValueChange
  inTransit: ValueChange
  standby: ValueChange
  recovering: ValueChange
  wounded: ValueChange
  terminated: ValueChange
}

export type PanicReport = {
  change: ValueChange
  breakdown: PanicBreakdown
}

export type PanicBreakdown = {
  factionContributions: {
    factionId: string
    factionName: string
    contribution: number
  }[]
  missionReductions: {
    missionSiteId: string
    missionTitle: string
    reduction: number
  }[]
}

export type FactionReport = {
  factionId: string
  factionName: string
  isDiscovered: boolean
  threatLevel: ValueChange
  threatIncrease: ValueChange
  suppression: ValueChange
  details: FactionDetails
}

// KJA rename to FactionReport; rename current FactionReport to FactionsReport
export type FactionDetails = {
  baseThreatIncrease: number
  missionImpacts: {
    missionSiteId: string
    missionTitle: string
    threatReduction?: number
    suppressionAdded?: number
  }[]
  suppressionDecay: number
}
