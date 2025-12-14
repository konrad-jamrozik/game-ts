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
