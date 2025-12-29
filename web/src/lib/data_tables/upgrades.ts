import { toF6, type Fixed6, isF6 } from '../primitives/fixed6'

export type UpgradeName =
  | 'Agent cap'
  | 'Transport cap'
  | 'Training cap'
  | 'Training skill gain'
  | 'Exhaustion recovery'
  | 'Hit points recovery %'
  | 'Weapon damage'

export const UPGRADE_PRICES: Record<UpgradeName, number> = {
  'Agent cap': 200,
  'Transport cap': 1000,
  'Training cap': 200,
  'Training skill gain': 1000,
  'Exhaustion recovery': 1000,
  'Hit points recovery %': 1000,
  'Weapon damage': 1000,
}

export const UPGRADE_INCREMENTS: Record<UpgradeName, number | Fixed6> = {
  'Agent cap': 4,
  'Transport cap': 2,
  'Training cap': 4,
  'Training skill gain': toF6(0.05),
  'Exhaustion recovery': toF6(0.2),
  'Hit points recovery %': toF6(0.2),
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
