import type { Mission } from '../model/model'
import { assertDefined } from '../utils/assert'

export const missions: Mission[] = [
  {
    id: 'mission-apprehend-red-dawn',
    title: 'Apprehend Red Dawn member',
    description: 'Apprehend a member of the Red Dawn cult.',
    expiresIn: 3,
    dependsOn: ['lead-red-dawn-location'],
    rewards: {
      money: 0,
      intel: 10,
      panicReduction: 10,
      factionRewards: new Set([
        {
          factionId: 'faction-red-dawn',
          threatReduction: 10,
          suppression: 10,
        },
      ]),
    },
  },
  {
    id: 'mission-raid-red-dawn-safehouse',
    title: 'Raid Red Dawn Safehouse',
    description: 'Raid a Red Dawn cult safehouse.',
    expiresIn: 8,
    dependsOn: ['lead-red-dawn-safehouse'],
    rewards: {
      money: 120,
      intel: 40,
      funding: 0,
      panicReduction: 20,
      factionRewards: new Set([
        {
          factionId: 'faction-red-dawn',
          threatReduction: 40,
          suppression: 40,
        },
      ]),
    },
  },
  //   {
  //     id: 'mission-surveillance',
  //     title: 'Surveillance Operation',
  //     description: 'Deploy agents to conduct surveillance on suspicious activities.',
  //     expiresIn: 'never',
  //     dependsOn: [],
  //   },
  //   {
  //     id: 'mission-infiltration',
  //     title: 'Infiltration Mission',
  //     description: 'Infiltrate a target organization to gather intelligence.',
  //     expiresIn: 'never',
  //     dependsOn: ['lead-criminal-orgs'],
  //   },
  //   {
  //     id: 'mission-sabotage',
  //     title: 'Sabotage Operation',
  //     description: 'Sabotage enemy operations to disrupt their activities.',
  //     expiresIn: 'never',
  //     dependsOn: ['lead-red-dawn-profile'],
  //   },
  //   {
  //     id: 'mission-extraction',
  //     title: 'Extraction Mission',
  //     description: 'Extract a valuable asset from a dangerous location.',
  //     expiresIn: 'never',
  //     dependsOn: ['lead-red-dawn-safehouse'],
  //   },
]

export function getMissionById(missionId: string): Mission {
  const foundMission = missions.find((mission) => mission.id === missionId)
  assertDefined(foundMission, `Mission with id ${missionId} not found`)
  return foundMission
}
