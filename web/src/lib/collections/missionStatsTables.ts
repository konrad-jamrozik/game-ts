/**
 * Offensive mission statistics
 *
 * This table defines player offensive missions - missions where the player actively
 * attacks faction locations and operations.
 *
 * Legend:
 * - Name: Mission name/title.
 * - ExpiresIn: Number of turns before the mission expires.
 * - Enemy counts (Init, Oper, Hndl, etc.): Number of each enemy type present on the mission.
 * - MoneyReward: Money reward for completing the mission.
 * - FundingReward: Funding reward for completing the mission.
 * - PanicReductionPct: Panic reduction percentage (as decimal, e.g., 0.05 = 0.05%).
 * - Suppression: Suppression reward range (e.g., "1-3" or "N/A" for final mission).
 *
 * For mission descriptions, refer to:
 * https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/69367e41-e044-8332-baa8-f61660ca87af
 */

type OffensiveMissionRow = [
  name: string,
  expiresIn: number,
  initiate: number,
  operative: number,
  handler: number,
  soldier: number,
  lieutenant: number,
  elite: number,
  commander: number,
  highCommander: number,
  cultLeader: number,
  moneyReward: number,
  fundingReward: number,
  panicReductionPct: number,
  suppression: string,
]

// prettier-ignore
export const OFFENSIVE_MISSIONS_DATA: OffensiveMissionRow[] = [
  // Name,                         ExpIn, Init, Oper, Hndl, Sldr, Ltnt, Elit, Cmdr,  HCmd, CLdr, MoneyR, FundR,    PanicR%, Suppr.
  ['Apprehend cult member',            5,    2,    1,    0,    0,    0,    0,    0,     0,    0,      5,     0,      0.05 ,     '0'],
  ['Raid cult safehouse',              8,    4,    4,    1,    0,    0,    0,    0,     0,    0,    100,     5,      0.1  ,     '1'],
  ['Raid cult outpost',               10,    8,    8,    3,    2,    0,    0,    0,     0,    0,    400,    10,      0.5  ,   '1-3'],
  ['Raid cult training facility',     12,   30,   16,    6,    4,    1,    0,    0,     0,    0,    800,    15,      1    ,   '3-9'],
  ['Raid cult logistics hub',         15,   12,   24,    5,   10,    2,    2,    1,     0,    0,   2000,    20,      2    ,  '5-15'],
  ['Raid cult command center',        20,    0,   20,    4,   20,    4,    6,    3,     0,    0,   3000,    25,      5    , '10-30'],
  ['Raid cult regional stronghold',   30,    0,    0,    0,   40,    8,   10,    3,     1,    0,   5000,    50,     10    , '15-45'],
  ['Raid cult HQ',                    40,    0,    0,    0,   60,   12,   20,    6,     2,    1, 10_000,   100,     20    ,   'N/A'],
]

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

type DefensiveMissionRow = [
  name: string,
  level: number,
  expiresIn: number,
  initiate: number,
  operative: number,
  handler: number,
  soldier: number,
  lieutenant: number,
  elite: number,
  commander: number,
  highCommander: number,
  cultLeader: number,
]

// prettier-ignore
export const DEFENSIVE_MISSIONS_DATA: DefensiveMissionRow[] = [
  // Name,                                 Lvl,  ExpIn, Init, Oper, Hndl, Sldr, Ltnt, Elit, Cmdr, HCmd, CLdr
  ['Foil recruitment push',                  1,      3,    4,    1,    0,    0,    0,    0,    0,    0,    0],
  ['Foil supply theft',                      1,      3,    4,    3,    0,    0,    0,    0,    0,    0,    0],
  ['Foil business extortion',                1,      3,    6,    2,    1,    0,    0,    0,    0,    0,    0],
  ['Foil sabotage',                          2,      4,    2,    2,    1,    1,    0,    0,    0,    0,    0],
  ['Foil VIP assassination',                 2,      4,    4,    4,    1,    2,    0,    0,    0,    0,    0],
  ['Defend against office raid',             2,      4,   10,    6,    2,    4,    1,    0,    0,    0,    0],
  ['Foil financial heist',                   3,      5,   10,   10,    4,    8,    2,    0,    0,    0,    0],
  ['Intercept arms deal',                    3,      5,   12,   12,    4,   10,    2,    2,    1,    0,    0],
  ['Defend against facility raid',           3,      5,   16,   12,    6,   12,    3,    2,    1,    0,    0],
  ['Counter civilian terror',                4,      6,   30,   24,   10,   15,    3,    2,    1,    0,    0],
  ['Defend against city government assault', 4,      6,   20,   16,    6,   20,    4,    4,    2,    0,    0],
  ['Defend against retaliation strike',      4,      6,   10,    6,    2,   24,    6,    6,    3,    0,    0],
  ['Foil nuclear plant bombing',             5,      7,    0,    0,    0,    0,    0,    8,    3,    1,    0],
  ['Foil coup attempt',                      5,      7,    0,    0,    0,    0,    0,    0,    0,    1,    0],
  ['Defend military installation',           5,      7,    0,    0,    0,    0,    0,    0,    0,    1,    0],
  ['Defend against HQ assault',              6,      8,    0,    0,    0,    0,    0,    0,    0,    1,    0],
]
