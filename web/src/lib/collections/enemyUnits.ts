export const ENEMY_UNIT_STATS: Record<string, { skill: number; hp: number; damage: number; isOfficer: boolean }> = {
  Initiate: { skill: 40, hp: 20, damage: 8, isOfficer: false },
  Operative: { skill: 60, hp: 20, damage: 10, isOfficer: false },
  Handler: { skill: 70, hp: 20, damage: 10, isOfficer: true },
  Soldier: { skill: 100, hp: 30, damage: 14, isOfficer: false },
  Lieutenant: { skill: 120, hp: 30, damage: 14, isOfficer: true },
  Elite: { skill: 200, hp: 40, damage: 20, isOfficer: false },
  Commander: { skill: 250, hp: 40, damage: 20, isOfficer: true },
  HighCommander: { skill: 400, hp: 50, damage: 30, isOfficer: true },
}
