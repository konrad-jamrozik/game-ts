import type { Mission } from '../model/model'
import { assertDefined } from '../utils/assert'

export const missions: Mission[] = [
  {
    id: 'mission-apprehend-red-dawn',
    title: 'Apprehend Red Dawn member',
    description: 'Apprehend a member of the Red Dawn cult.',
    expiresIn: 3,
    dependsOn: ['lead-red-dawn-location'],
    objectives: [
      { id: 'locate-target', difficulty: 20 },
      { id: 'apprehend-target', difficulty: 30 },
    ],
    difficulty: 30,
    rewards: {
      money: 0,
      intel: 10,
      panicReduction: 5,
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: 1,
          suppression: 10,
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-safehouse',
    title: 'Raid Red Dawn Safehouse',
    description: 'Raid a Red Dawn cult safehouse.',
    expiresIn: 8,
    dependsOn: ['lead-red-dawn-safehouse'],
    objectives: [
      { id: 'breach-perimeter', difficulty: 20 },
      { id: 'secure-evidence', difficulty: 30 },
      { id: 'neutralize-resistance', difficulty: 50 },
    ],
    difficulty: 50,
    rewards: {
      money: 120,
      intel: 40,
      funding: 0,
      panicReduction: 20,
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: 5,
          suppression: 40,
        },
      ],
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
