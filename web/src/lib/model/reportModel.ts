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

export function newValueChange<TNumber extends number | Bps = number>(
  previous: TNumber,
  current: TNumber,
): ValueChange<TNumber> {
  // KJA review, especially the linter disablement
  // Handle Bps values specially
  if (isBps(previous) && isBps(current)) {
    const delta = current.value - previous.value
    return {
      previous,
      current,
      get delta(): TNumber {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return bps(delta) as TNumber
      },
    }
  }

  // Handle number values
  // TypeScript can't narrow the type here, but we know from the if condition above that these are numbers
  const delta = Number(current) - Number(previous)
  return {
    previous,
    current,
    get delta(): TNumber {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return delta as TNumber
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
