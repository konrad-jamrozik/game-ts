/**
 * Offensive missions data table
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

import type { FactionData } from './factionsDataTable'
import { bldMissionDataId, expandTemplateString, type BaseMissionData } from './dataTablesPrivateUtils'

// prettier-ignore
export function bldOffensiveMissionsTable(factions: readonly FactionData[]): readonly OffensiveMissionData[] {
  return toOffensiveMissionsDataTable([
  // Name,                              Level, ExpIn, Init, Oper, Sldr,  Elit, Hndl, Ltnt, Cmdr,  HCmd, CLdr, MoneyR, FundR,    PanicR%, Suppr., DependsOn, Description
  ['Apprehend {facName} member',            1,     5,    2,    1,    0,     0,    0,    0,    0,     0,    0,      5,     0,      0.05 ,     '0', ['lead-{facId}-member'], 'Apprehend a member of {facName}.'],
  ['Raid {facName} safehouse',              2,     8,    4,    4,    0,     0,    1,    0,    0,     0,    0,    100,     5,      0.1  ,     '1', ['lead-{facId}-safehouse'], 'Raid cult safehouse of {facName}.'],
  ['Raid {facName} outpost',                3,    10,   12,    8,    3,     0,    4,    0,    0,     0,    0,    400,    10,      0.5  ,   '1-3', ['lead-{facId}-outpost'], 'Raid cult outpost of {facName}.'],
  ['Raid {facName} training facility',      4,    12,   40,   20,    4,     0,   10,    1,    0,     0,    0,    800,    15,      1    ,   '3-9', ['lead-{facId}-training-facility'], 'Raid cult training facility of {facName}.'],
  ['Raid {facName} logistics hub',          5,    15,   32,   16,   20,     4,    6,    4,    1,     0,    0,   2000,    20,      2    ,  '5-15', ['lead-{facId}-logistics-hub'], 'Raid cult logistics hub of {facName}.'],
  ['Raid {facName} command center',         6,    20,   20,   20,   30,    10,    8,    6,    3,     0,    0,   3000,    25,      5    , '10-30', ['lead-{facId}-command-center'], 'Raid cult command center of {facName}.'],
  ['Raid {facName} regional stronghold',    7,    30,   20,   40,   40,    12,   10,    8,    3,     1,    0,   5000,    50,     10    , '15-45', ['lead-{facId}-regional-stronghold'], 'Raid cult regional stronghold of {facName}.'],
  ['Raid {facName} HQ',                     8,    40,    0,    0,   60,    30,    0,   12,    6,     2,    1, 10_000,   100,     20    ,   'N/A', ['lead-{facId}-hq'], 'Final assault on {facName} headquarters.'],
  ], factions)
}

export type OffensiveMissionData = BaseMissionData & {
  moneyReward: number
  fundingReward: number
  panicReductionPct: number
  suppression: string
  dependsOn: string[]
  description: string
}

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

function toOffensiveMissionsDataTable(
  rows: OffensiveMissionRow[],
  factions: readonly FactionData[],
): OffensiveMissionData[] {
  const result: OffensiveMissionData[] = []

  for (const row of rows) {
    const rawMission = {
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
    }

    for (const faction of factions) {
      const templatedName = expandTemplateString(rawMission.name, faction)

      result.push({
        id: bldMissionDataId(templatedName),
        name: templatedName,
        description: expandTemplateString(rawMission.description, faction),
        level: rawMission.level,
        expiresIn: rawMission.expiresIn,
        enemyCounts: {
          initiate: rawMission.initiate,
          operative: rawMission.operative,
          soldier: rawMission.soldier,
          elite: rawMission.elite,
          handler: rawMission.handler,
          lieutenant: rawMission.lieutenant,
          commander: rawMission.commander,
          highCommander: rawMission.highCommander,
          cultLeader: rawMission.cultLeader,
        },
        moneyReward: rawMission.moneyReward,
        fundingReward: rawMission.fundingReward,
        panicReductionPct: rawMission.panicReductionPct,
        suppression: rawMission.suppression,
        dependsOn: rawMission.dependsOn.map((dep) => expandTemplateString(dep, faction)),
        factionId: faction.id,
      })
    }
  }

  return result
}
