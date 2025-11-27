import { toF2, type Fixed2 } from '../model/fixed2'

export const ENEMY_STATS: Record<string, { skill: Fixed2; hp: number; damage: number; isOfficer: boolean }> = {
  Initiate: { skill: toF2(40), hp: 20, damage: 8, isOfficer: false },
  Operative: { skill: toF2(60), hp: 20, damage: 10, isOfficer: false },
  Handler: { skill: toF2(70), hp: 20, damage: 10, isOfficer: true },
  Soldier: { skill: toF2(100), hp: 30, damage: 14, isOfficer: false },
  Lieutenant: { skill: toF2(120), hp: 30, damage: 14, isOfficer: true },
  Elite: { skill: toF2(200), hp: 40, damage: 20, isOfficer: false },
  Commander: { skill: toF2(250), hp: 40, damage: 20, isOfficer: true },
  HighCommander: { skill: toF2(400), hp: 50, damage: 30, isOfficer: true },
}
