import type { Mission } from '../model/model'
import { assertDefined } from '../utils/assert'
import { createEnemyUnitsFromSpec } from '../utils/enemyUnitUtils'

export const missions: Mission[] = [
  {
    id: 'mission-apprehend-red-dawn',
    title: 'Apprehend Red Dawn member',
    description: 'Apprehend a member of the Red Dawn cult.',
    expiresIn: 3,
    dependsOn: ['lead-red-dawn-location'],
    enemyUnits: createEnemyUnitsFromSpec('2 Initiate, 1 Operative'),
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
    enemyUnits: createEnemyUnitsFromSpec('4 Initiate, 3 Operative, 1 Handler'),
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
  {
    id: 'mission-raid-red-dawn-outpost',
    title: 'Raid Red Dawn Outpost',
    description: 'Raid a fortified Red Dawn outpost.',
    expiresIn: 10,
    dependsOn: ['lead-red-dawn-outpost'],
    enemyUnits: createEnemyUnitsFromSpec('4 Initiate, 6 Operative, 4 Soldier, 2 Handler, 1 Lieutenant'),
    rewards: {
      money: 150,
      intel: 50,
      panicReduction: 40,
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: 20,
          suppression: 50,
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-base',
    title: 'Raid Red Dawn Base of Operations',
    description: 'Assault the Red Dawn base of operations.',
    expiresIn: 12,
    dependsOn: ['lead-red-dawn-base'],
    enemyUnits: createEnemyUnitsFromSpec('10 Operative, 10 Soldier, 2 Elite, 4 Handler, 2 Lieutenant, 1 Commander'),
    rewards: {
      money: 200,
      intel: 60,
      panicReduction: 30,
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: 7,
          suppression: 60,
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-hq',
    title: 'Raid Red Dawn HQ',
    description: 'Final assault on Red Dawn headquarters.',
    expiresIn: 15,
    dependsOn: ['lead-red-dawn-hq'],
    enemyUnits: createEnemyUnitsFromSpec('20 Soldier, 6 Elite, 4 Lieutenant, 2 Commander, 1 HighCommander'),
    rewards: {
      money: 250,
      intel: 70,
      panicReduction: 35,
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: 8,
          suppression: 70,
        },
      ],
    },
  },
]

export function getMissionById(missionId: string): Mission {
  const foundMission = missions.find((mission) => mission.id === missionId)
  assertDefined(foundMission, `Mission with id ${missionId} not found`)
  return foundMission
}
