import { toF6 } from '../primitives/fixed6'
import type { Mission } from '../model/model'
import { assertDefined } from '../primitives/assertPrimitives'

export const missions: Mission[] = [
  {
    id: 'mission-apprehend-red-dawn',
    title: 'Apprehend Red Dawn member',
    description: 'Apprehend a member of the Red Dawn cult.',
    expiresIn: 3,
    dependsOn: ['lead-red-dawn-location'],
    enemyUnitsSpec: '2 Initiate, 1 Operative',
    rewards: {
      money: 5,
      funding: 0,
      intel: 0,
      panicReduction: toF6(0.0005),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.0001),
          suppression: toF6(0.001),
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
    enemyUnitsSpec: '4 Initiate, 3 Operative, 1 Handler',
    rewards: {
      money: 100,
      funding: 5,
      intel: 10,
      panicReduction: toF6(0.002),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.001),
          suppression: toF6(0.1),
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
    enemyUnitsSpec: '4 Initiate, 6 Operative, 4 Soldier, 2 Handler, 1 Lieutenant',
    rewards: {
      money: 400,
      funding: 10,
      intel: 20,
      panicReduction: toF6(0.01),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.01),
          suppression: toF6(0.5),
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
    enemyUnitsSpec: '10 Operative, 10 Soldier, 2 Elite, 4 Handler, 2 Lieutenant, 1 Commander',
    rewards: {
      money: 1000,
      funding: 20,
      intel: 50,
      panicReduction: toF6(0.05),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.05),
          suppression: toF6(1),
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
    enemyUnitsSpec: '20 Soldier, 6 Elite, 4 Lieutenant, 2 Commander, 1 HighCommander',
    rewards: {
      money: 5000,
      funding: 50,
      intel: 100,
      panicReduction: toF6(0.2),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(1),
          suppression: toF6(1),
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
