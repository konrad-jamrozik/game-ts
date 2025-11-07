import type { Bps } from './bps'

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

export type ValueChange<T extends number = number> = {
  previous: T
  current: T
  readonly delta: T
}

export function newValueChange<T extends number = number>(previous: T, current: T): ValueChange<T> {
  // Bps and other branded number types need arithmetic operations
  // The subtraction is safe because T extends number
  // We need to cast to number for the arithmetic, then back to T
  // This is a known limitation when working with branded types
  // KJA fix squiggly
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  const delta = ((current as unknown as number) - (previous as unknown as number)) as T
  return {
    previous,
    current,
    get delta(): T {
      return delta
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
  unscathed: ValueChange
  terminated: ValueChange
}

export type PanicReport = {
  change: ValueChange<Bps>
  breakdown: PanicBreakdown
}

export type PanicBreakdown = {
  factionPanicIncreases: {
    factionId: string
    factionName: string
    factionPanicIncrease: Bps
  }[]
  missionReductions: {
    missionSiteId: string
    missionTitle: string
    reduction: Bps
  }[]
}

// export type Faction = {
//   id: FactionId
//   name: string
//   threatLevel: number
//   threatIncrease: number
//   suppression: number
//   discoveryPrerequisite: string[]
// }

export type FactionReport = {
  factionId: string
  factionName: string
  isDiscovered: boolean
  threatLevel: ValueChange<Bps>
  threatIncrease: ValueChange<Bps>
  suppression: ValueChange<Bps>
  baseThreatIncrease: Bps
  missionImpacts: {
    missionSiteId: string
    missionTitle: string
    threatReduction?: Bps
    suppressionAdded?: Bps
  }[]
  suppressionDecay: Bps
}
