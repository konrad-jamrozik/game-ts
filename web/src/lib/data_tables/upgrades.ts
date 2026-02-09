import { toF6, type Fixed6, isF6 } from '../primitives/fixed6'
import { AGENT_CAP, TRANSPORT_CAP, TRAINING_CAP } from './constants'

// KJA need to distinguish cap upgrade from stat upgrade
export type UpgradeName =
  | 'Agent cap'
  | 'Transport cap'
  | 'Training cap'
  | 'Training skill gain'
  | 'Exhaustion recovery %'
  | 'Hit points recovery %'
  | 'Hit points'
  | 'Weapon damage'

export const UPGRADE_PRICES: Record<UpgradeName, number> = {
  'Agent cap': 200,
  'Transport cap': 1000,
  'Training cap': 200,
  'Training skill gain': 500,
  'Exhaustion recovery %': 500,
  'Hit points recovery %': 500,
  'Hit points': 500,
  'Weapon damage': 500,
}

export const UPGRADE_INCREMENTS: Record<UpgradeName, number | Fixed6> = {
  'Agent cap': 4,
  'Transport cap': 2,
  'Training cap': 4,
  'Training skill gain': toF6(0.1),
  'Exhaustion recovery %': toF6(0.5),
  'Hit points recovery %': toF6(0.2),
  'Hit points': 1,
  'Weapon damage': 1,
}

export function getUpgradePrice(upgradeName: UpgradeName): number {
  return UPGRADE_PRICES[upgradeName]
}

export function getUpgradeIncrement(upgradeName: UpgradeName): number {
  const increment = UPGRADE_INCREMENTS[upgradeName]
  if (isF6(increment)) {
    return increment.value / 1_000_000
  }
  return increment
}

export function getUpgradeIncrementFixed6(upgradeName: UpgradeName): Fixed6 {
  const increment = UPGRADE_INCREMENTS[upgradeName]
  if (isF6(increment)) {
    return increment
  }
  return toF6(increment)
}

export function computeAgentCap(upgradeCount: number): number {
  return AGENT_CAP + upgradeCount * getUpgradeIncrement('Agent cap')
}

export function computeTransportCap(upgradeCount: number): number {
  return TRANSPORT_CAP + upgradeCount * getUpgradeIncrement('Transport cap')
}

export function computeTrainingCap(upgradeCount: number): number {
  return TRAINING_CAP + upgradeCount * getUpgradeIncrement('Training cap')
}
