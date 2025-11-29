import { asF6, type Fixed6 } from '../model/fixed6'

export const ENEMY_STATS: Record<string, { skill: Fixed6; hp: number; damage: number; isOfficer: boolean }> = {
  Initiate: { skill: asF6(40), hp: 20, damage: 8, isOfficer: false },
  Operative: { skill: asF6(60), hp: 20, damage: 10, isOfficer: false },
  Handler: { skill: asF6(70), hp: 20, damage: 10, isOfficer: true },
  Soldier: { skill: asF6(100), hp: 30, damage: 14, isOfficer: false },
  Lieutenant: { skill: asF6(120), hp: 30, damage: 14, isOfficer: true },
  Elite: { skill: asF6(200), hp: 40, damage: 20, isOfficer: false },
  Commander: { skill: asF6(250), hp: 40, damage: 20, isOfficer: true },
  HighCommander: { skill: asF6(400), hp: 50, damage: 30, isOfficer: true },
}
