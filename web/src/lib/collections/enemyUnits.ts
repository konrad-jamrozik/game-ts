import { toF6, type Fixed6 } from '../primitives/fixed6'

export const ENEMY_STATS: Record<string, { skill: Fixed6; hp: number; damage: number; isOfficer: boolean }> = {
  Initiate: { skill: toF6(40), hp: 20, damage: 8, isOfficer: false },
  Operative: { skill: toF6(60), hp: 25, damage: 10, isOfficer: false },
  Handler: { skill: toF6(80), hp: 25, damage: 10, isOfficer: true },
  Soldier: { skill: toF6(120), hp: 30, damage: 14, isOfficer: false },
  Lieutenant: { skill: toF6(140), hp: 30, damage: 16, isOfficer: true },
  Elite: { skill: toF6(250), hp: 40, damage: 20, isOfficer: false },
  Commander: { skill: toF6(300), hp: 40, damage: 22, isOfficer: true },
  HighCommander: { skill: toF6(500), hp: 50, damage: 28, isOfficer: true },
  CultLeader: { skill: toF6(800), hp: 80, damage: 32, isOfficer: true },
}
