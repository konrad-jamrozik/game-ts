/**
 * Offensive mission statistics
 *
 * This table defines player offensive missions - missions where the player actively
 * attacks faction locations and operations.
 *
 * Legend:
 * - Name: Mission name/title.
 * - Level: Mission level (1-8), indicating difficulty/progression tier.
 * - ExpIn: Number of turns before the mission expires.
 * - Enemy counts (Init, Oper, Hndl, etc.): Number of each enemy type present on the mission.
 * - MoneyR: Money reward for completing the mission.
 * - FundR: Funding reward for completing the mission.
 * - PanicR%: Panic reduction percentage (as decimal, e.g., 0.05 = 0.05%).
 * - Suppr.: Suppression reward range (e.g., "1-3" or "N/A" for final mission).
 * - DependsOn: List of lead IDs that must be completed before this mission can be spawned.
 * - Description: Mission description text (may contain {facName} template string).
 *
 * For mission descriptions, refer to:
 * https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/69367e41-e044-8332-baa8-f61660ca87af
 */

// prettier-ignore
export const OFFENSIVE_MISSIONS_DATA: OffensiveMissionStats[] = toOffensiveMissionStats([
  // Name,                         Level, ExpIn, Init, Oper, Sldr,  Elit, Hndl, Ltnt, Cmdr,  HCmd, CLdr, MoneyR, FundR,    PanicR%, Suppr., DependsOn, Description
  ['Apprehend {facName} member',            1,     5,    2,    1,    0,     0,    1,    0,    0,     0,    0,      5,     0,      0.05 ,     '0', ['lead-{facId}-member'], 'Apprehend a member of {facName}.'],
  ['Raid {facName} safehouse',              2,     8,    4,    4,    0,     0,    1,    0,    0,     0,    0,    100,     5,      0.1  ,     '1', ['lead-{facId}-safehouse'], 'Raid cult safehouse of {facName}.'],
  ['Raid {facName} outpost',                3,    10,   12,    8,    3,     0,    4,    0,    0,     0,    0,    400,    10,      0.5  ,   '1-3', ['lead-{facId}-outpost'], 'Raid cult outpost of {facName}.'],
  ['Raid {facName} training facility',      4,    12,   40,   20,    4,     0,   10,    1,    0,     0,    0,    800,    15,      1    ,   '3-9', ['lead-{facId}-training-facility'], 'Raid cult training facility of {facName}.'],
  ['Raid {facName} logistics hub',          5,    15,   32,   16,   20,     4,    6,    4,    1,     0,    0,   2000,    20,      2    ,  '5-15', ['lead-{facId}-logistics-hub'], 'Raid cult logistics hub of {facName}.'],
  ['Raid {facName} command center',         6,    20,   20,   20,   30,    10,    8,    6,    3,     0,    0,   3000,    25,      5    , '10-30', ['lead-{facId}-command-center'], 'Raid cult command center of {facName}.'],
  ['Raid {facName} regional stronghold',    7,    30,   20,   40,   40,    12,   10,    8,    3,     1,    0,   5000,    50,     10    , '15-45', ['lead-{facId}-regional-stronghold'], 'Raid cult regional stronghold of {facName}.'],
  ['Raid {facName} HQ',                     8,    40,    0,    0,   60,    30,    0,   12,    6,     2,    1, 10_000,   100,     20    ,   'N/A', ['lead-{facId}-hq'], 'Final assault on {facName} headquarters.'],
])

/**
 * Defensive mission statistics
 *
 * This table defines player defensive missions - missions where the player counters
 * faction operations to prevent negative consequences.
 *
 * Legend:
 * - Name: Mission name/title.
 * - Level: Mission level (1-6), indicating difficulty tier:
 *   - Level 1 = soft operations
 *   - Level 2 = violent but small-scale
 *   - Level 3 = strategic threats
 *   - Level 4 = regional destabilization
 *   - Level 5 = global conflict
 *   - Level 6 = existential
 * - ExpiresIn: Number of turns before the mission expires.
 * - Enemy counts (Init, Oper, Hndl, etc.): Number of each enemy type present on the mission.
 *
 * Notes:
 * - Defensive missions have operation levels that determine rewards/penalties on success/failure.
 * - Level 6 existential missions result in game over if the player fails to complete them.
 *
 * For mission descriptions, refer to:
 * https://chatgpt.com/c/693636b5-3d44-8329-8977-25046b501f31
 */

// prettier-ignore
export const DEFENSIVE_MISSIONS_DATA: DefensiveMissionStats[] = toDefensiveMissionStats([
  // Name,                               Level,  ExpIn, Init, Oper, Sldr, Elit, Hndl, Ltnt,  Cmdr, HCmd, CLdr
  ['Foil {facName} recruitment push',                  1,      3,    4,    1,    0,    0,    0,    0,     0,    0,    0],
  ['Foil {facName} supply theft',                      1,      3,    4,    3,    0,    0,    0,    0,     0,    0,    0],
  ['Foil {facName} business extortion',                1,      3,    6,    2,    0,    0,    1,    0,     0,    0,    0],
  
  ['Foil {facName} sabotage',                          2,      4,    2,    2,    2,    0,    1,    1,     0,    0,    0],
  ['Foil {facName} VIP assassination',                 2,      4,    4,    4,    2,    0,    1,    0,     0,    0,    0],
  ['Defend against {facName} office raid',             2,      4,    4,    4,    4,    0,    1,    1,     0,    0,    0],
  
  ['Foil {facName} financial heist',                   3,      5,   10,   10,    8,    0,    4,    2,     0,    0,    0],
  ['Intercept {facName} arms deal',                    3,      5,   12,   12,   10,    2,    4,    2,     1,    0,    0],
  ['Defend against {facName} facility raid',           3,      5,   16,   12,   12,    2,    6,    3,     1,    0,    0],
  
  ['Counter {facName} civilian terror',                4,      6,   30,   24,   15,    4,   10,    3,     1,    0,    0],
  ['Defend against {facName} city government assault', 4,      6,   24,   24,   20,    8,    6,    4,     2,    0,    0],
  ['Defend against {facName} retaliation strike',      4,      6,   24,    8,   24,    8,    4,    6,     3,    0,    0],
  
  ['Foil {facName} coup attempt',                      5,      7,    0,   20,   20,   20,    0,    5,     5,    1,    0],
  ['Foil {facName} nuclear plant bombing',             5,      7,   28,   24,   20,   12,   10,    5,     3,    1,    0],
  ['Defend {facName} military installation',           5,      7,   20,   30,   24,   12,    7,    6,     3,    1,    0],
  
  ['Defend against {facName} HQ assault',              6,      8,   40,   40,   40,   10,   10,   10,     4,    1,    0],
])

export type OffensiveMissionStats = {
  name: string
  level: number
  expiresIn: number
  initiate: number
  operative: number
  soldier: number
  elite: number
  handler: number
  lieutenant: number
  commander: number
  highCommander: number
  cultLeader: number
  moneyReward: number
  fundingReward: number
  panicReductionPct: number
  suppression: string
  dependsOn: string[]
  description: string
}

export type DefensiveMissionStats = {
  name: string
  level: number
  expiresIn: number
  initiate: number
  operative: number
  soldier: number
  elite: number
  handler: number
  lieutenant: number
  commander: number
  highCommander: number
  cultLeader: number
}

type DefensiveMissionRow = [
  name: string,
  level: number,
  expiresIn: number,
  initiate: number,
  operative: number,
  soldier: number,
  elite: number,
  handler: number,
  lieutenant: number,
  commander: number,
  highCommander: number,
  cultLeader: number,
]

type OffensiveMissionRow = [
  name: string,
  level: number,
  expiresIn: number,
  initiate: number,
  operative: number,
  soldier: number,
  elite: number,
  handler: number,
  lieutenant: number,
  commander: number,
  highCommander: number,
  cultLeader: number,
  moneyReward: number,
  fundingReward: number,
  panicReductionPct: number,
  suppression: string,
  dependsOn: string[],
  description: string,
]

function toOffensiveMissionStats(rows: OffensiveMissionRow[]): OffensiveMissionStats[] {
  return rows.map((row) => ({
    name: row[0],
    level: row[1],
    expiresIn: row[2],
    initiate: row[3],
    operative: row[4],
    soldier: row[5],
    elite: row[6],
    handler: row[7],
    lieutenant: row[8],
    commander: row[9],
    highCommander: row[10],
    cultLeader: row[11],
    moneyReward: row[12],
    fundingReward: row[13],
    panicReductionPct: row[14],
    suppression: row[15],
    dependsOn: row[16],
    description: row[17],
  }))
}

function toDefensiveMissionStats(rows: DefensiveMissionRow[]): DefensiveMissionStats[] {
  return rows.map((row) => ({
    name: row[0],
    level: row[1],
    expiresIn: row[2],
    initiate: row[3],
    operative: row[4],
    soldier: row[5],
    elite: row[6],
    handler: row[7],
    lieutenant: row[8],
    commander: row[9],
    highCommander: row[10],
    cultLeader: row[11],
  }))
}
