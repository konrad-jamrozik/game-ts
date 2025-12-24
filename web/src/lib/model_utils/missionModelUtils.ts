import type { MissionId, MissionDataId } from '../model/missionModel'

export function assertIsMissionId(id: string): asserts id is MissionId {
  if (!id.startsWith('mission-')) {
    throw new Error(`Invalid mission ID: ${id}`)
  }
}

export function assertIsMissionDataId(id: string): asserts id is MissionDataId {
  if (!id.startsWith('missiondata-')) {
    throw new Error(`Invalid mission data ID: ${id}`)
  }
}
