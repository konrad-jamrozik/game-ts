import { bps } from '../model/bps'
import type { Mission } from '../model/model'
import { assertDefined } from '../utils/assert'

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
      intel: 0,
      panicReduction: bps(5),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: bps(1),
          suppression: bps(10),
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
      intel: 10,
      panicReduction: bps(20),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: bps(10),
          suppression: bps(1000),
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
      intel: 20,
      panicReduction: bps(100),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: bps(200),
          suppression: bps(5000),
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
      intel: 50,
      panicReduction: bps(500),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: bps(1000),
          suppression: bps(10_000),
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
      money: 10_000,
      intel: 100,
      panicReduction: bps(2000),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: bps(10_000),
          suppression: bps(10_000),
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
