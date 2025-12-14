type OffensiveMissionRow = [
  name: string,
  expiresIn: number,
  troops: string,
  officers: string,
  moneyReward: number,
  fundingReward: number,
  panicReductionPct: number,
  suppression: string,
]

// prettier-ignore
export const OFFENSIVE_MISSIONS_DATA: OffensiveMissionRow[] = [
  // Name,                         ExpIn, Troops,                      Officers,                           MoneyR, FundR, PanicR%, Suppr.
  ['Apprehend cult member',            5, '2 In,   1 Op'                ,  '',                                  5,     0,   0.05,     '0'],
  ['Raid cult safehouse',              8, '4 In,   4 Op'                , '1 Hn',                             100,     5,    0.1,     '1'],
  ['Raid cult outpost',               10, '8 In,   8 Op,  2 Sl'         , '3 Hn',                             400,    10,    0.5,   '1-3'],
  ['Raid cult training facility',     12, '30 In,  16 Op,  4 Sl'        , '6 Hn,  1 Lt',                      800,    15,      1,   '3-9'],
  ['Raid cult logistics hub',         15, '12 In,  24 Op, 10 Sl,  2 El' , '5 Hn,  2 Lt, 1 Cm',               2000,    20,      2,  '5-15'],
  ['Raid cult command center',        20, '- In,  20 Op, 20 Sl,  6 El'  , '4 Hn,  4 Lt, 3 Cm',               3000,    25,      5, '10-30'],
  ['Raid cult regional stronghold',   30, '- In,   - Op, 40 Sl, 10 El'  , '- Hn,  8 Lt, 3 Cm, 1 HC',         5000,    50,     10, '15-45'],
  ['Raid cult HQ',                    40, '- In,   - Op, 60 Sl, 20 El'  , '- Hn, 12 Lt, 6 Cm, 2 HC, 1 CL', 10_000,   100,     20,   'N/A'],
]
