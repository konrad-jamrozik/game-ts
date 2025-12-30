import type { Mission } from '../../lib/model/missionModel'

export type MissionCounts = {
  active: number
  expired: number
  successful: number
  failed: number
}

export function calculateMissionCounts(missions: Mission[]): MissionCounts {
  const active = missions.filter((mission) => mission.state === 'Active' || mission.state === 'Deployed').length
  const expired = missions.filter((mission) => mission.state === 'Expired').length
  const successful = missions.filter((mission) => mission.state === 'Won').length
  const failed = missions.filter((mission) => mission.state === 'Wiped' || mission.state === 'Retreated').length

  return {
    active,
    expired,
    successful,
    failed,
  }
}
