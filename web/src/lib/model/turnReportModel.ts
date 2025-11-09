import { bps, isBps, type Bps } from './bps'

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

export type ValueChange<TNumber extends number | Bps = number> = {
  previous: TNumber
  current: TNumber
  readonly delta: TNumber
}

// --- Overloads ---
export function newValueChange(previous: Bps, current: Bps): ValueChange<Bps>
export function newValueChange(previous: number, current: number): ValueChange

// --- Implementation ---
export function newValueChange(previous: Bps | number, current: Bps | number): ValueChange<Bps> | ValueChange {
  if (isBps(previous) && isBps(current)) {
    return {
      previous,
      current,
      delta: bps(current.value - previous.value),
    }
  }

  if (typeof previous === 'number' && typeof current === 'number') {
    return {
      previous,
      current,
      delta: current - previous,
    }
  }

  // Exhaustive guard: disallow mixing number with Bps
  throw new TypeError('newValueChange: mixed types (number vs Bps) are not allowed.')
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
