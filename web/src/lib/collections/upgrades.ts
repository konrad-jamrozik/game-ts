import { toF6, type Fixed6, isF6 } from '../model/fixed6'

export type UpgradeName =
  | 'Agent cap'
  | 'Transport cap'
  | 'Training cap'
  | 'Training skill gain'
  | 'Exhaustion recovery'
  | 'Hit points recovery %'

export const UPGRADE_PRICES: Record<UpgradeName, number> = {
  'Agent cap': 50,
  'Transport cap': 500,
  'Training cap': 50,
  'Training skill gain': 400,
  'Exhaustion recovery': 500,
  'Hit points recovery %': 1000,
}

export const UPGRADE_INCREMENTS: Record<UpgradeName, number | Fixed6> = {
  'Agent cap': 1,
  'Transport cap': 1,
  'Training cap': 1,
  'Training skill gain': toF6(0.1),
  'Exhaustion recovery': 1,
  'Hit points recovery %': 1,
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
