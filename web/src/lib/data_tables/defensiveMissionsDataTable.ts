/**
 * Defensive missions data table
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

import { fmtNoPrefix } from '../primitives/formatPrimitives'
import type { MissionDataId } from '../model/missionModel'
import type { FactionId } from '../model/factionModel'
import type { FactionData } from './factionsDataTable'

// prettier-ignore
export function bldDefensiveMissionsTable(factions: readonly FactionData[]): readonly DefensiveMissionData[] {
  return toDefensiveMissionsDataTable([
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
  ], factions)
}

export type DefensiveMissionData = {
  id: MissionDataId
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
  factionId: FactionId
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

function toDefensiveMissionsDataTable(
  rows: DefensiveMissionRow[],
  factions: readonly FactionData[],
): DefensiveMissionData[] {
  const result: DefensiveMissionData[] = []

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
    }

    for (const faction of factions) {
      const templatedName = expandTemplateString(rawMission.name, faction)

      result.push({
        id: bldMissionDataId(templatedName),
        name: templatedName,
        level: rawMission.level,
        expiresIn: rawMission.expiresIn,
        initiate: rawMission.initiate,
        operative: rawMission.operative,
        soldier: rawMission.soldier,
        elite: rawMission.elite,
        handler: rawMission.handler,
        lieutenant: rawMission.lieutenant,
        commander: rawMission.commander,
        highCommander: rawMission.highCommander,
        cultLeader: rawMission.cultLeader,
        factionId: faction.id,
      })
    }
  }

  return result
}

// KJA1 dedup this and other funcs in dataTables construction
function expandTemplateString(template: string, faction: FactionData): string {
  const shortId = fmtNoPrefix(faction.id, 'faction-')
  return template.replaceAll('{facId}', shortId).replaceAll('{facName}', faction.name)
}

// KJA1 dedup this and other funcs in dataTables construction
function bldMissionDataId(templatedName: string): MissionDataId {
  const baseId = templatedName.toLowerCase().replaceAll(' ', '-')
  return `missiondata-${baseId}`
}
