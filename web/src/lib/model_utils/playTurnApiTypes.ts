import type { GameState } from '../model/gameStateModel'
import type { BasicIntellectState } from '../../redux/slices/aiStateSlice'
import type { PlayerActionsAPI } from './playerActionsApiTypes'

export type { ActionResult } from './playerActionsApiTypes'

export type PlayTurnAPI = PlayerActionsAPI & {
  gameState: GameState
  aiState: BasicIntellectState
  incrementActualWeaponDamageUpgrades(): void
  incrementActualTrainingSkillGainUpgrades(): void
  incrementActualExhaustionRecoveryUpgrades(): void
  incrementActualHitPointsRecoveryUpgrades(): void
  increaseDesiredCounts(): void
}
