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
    factionId: 'faction-red-dawn',
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
    title: 'Raid cult safehouse',
    description: 'Raid a Red Dawn cult safehouse.',
    expiresIn: 8,
    dependsOn: ['lead-red-dawn-safehouse'],
    enemyUnitsSpec: '4 Initiate, 4 Operative, 1 Handler',
    factionId: 'faction-red-dawn',
    rewards: {
      money: 100,
      funding: 5,
      intel: 10,
      panicReduction: toF6(0.001),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.001),
          suppression: toF6(0.01),
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-outpost',
    title: 'Raid cult outpost',
    description: 'Raid a fortified Red Dawn outpost.',
    expiresIn: 10,
    dependsOn: ['lead-red-dawn-outpost'],
    enemyUnitsSpec: '8 Initiate, 8 Operative, 4 Soldier, 2 Handler, 1 Lieutenant',
    factionId: 'faction-red-dawn',
    rewards: {
      money: 400,
      funding: 10,
      intel: 20,
      panicReduction: toF6(0.005),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.01),
          suppression: toF6(0.02),
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-training-facility',
    title: 'Raid cult training facility',
    description: 'Raid a Red Dawn training facility.',
    expiresIn: 12,
    dependsOn: ['lead-red-dawn-base'],
    enemyUnitsSpec: '30 Initiate, 16 Operative, 8 Soldier, 6 Handler, 2 Lieutenant',
    factionId: 'faction-red-dawn',
    rewards: {
      money: 800,
      funding: 15,
      intel: 30,
      panicReduction: toF6(0.01),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.03),
          suppression: toF6(0.03),
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-logistics-hub',
    title: 'Raid cult logistics hub',
    description: 'Raid a Red Dawn logistics hub.',
    expiresIn: 15,
    dependsOn: ['lead-red-dawn-interrogate-commander'],
    enemyUnitsSpec: '12 Initiate, 24 Operative, 10 Soldier, 2 Elite, 5 Handler, 2 Lieutenant, 1 Commander',
    factionId: 'faction-red-dawn',
    rewards: {
      money: 2000,
      funding: 20,
      intel: 40,
      panicReduction: toF6(0.02),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.05),
          suppression: toF6(0.05),
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-command-center',
    title: 'Raid cult command center',
    description: 'Raid a Red Dawn command center.',
    expiresIn: 20,
    dependsOn: ['lead-red-dawn-interrogate-commander'],
    enemyUnitsSpec: '20 Operative, 20 Soldier, 6 Elite, 4 Handler, 4 Lieutenant, 3 Commander',
    factionId: 'faction-red-dawn',
    rewards: {
      money: 3000,
      funding: 25,
      intel: 50,
      panicReduction: toF6(0.05),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.1),
          suppression: toF6(0.1),
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-stronghold',
    title: 'Raid cult regional stronghold',
    description: 'Raid a Red Dawn regional stronghold.',
    expiresIn: 30,
    dependsOn: ['lead-red-dawn-interrogate-commander'],
    enemyUnitsSpec: '40 Soldier, 10 Elite, 8 Lieutenant, 3 Commander, 1 HighCommander',
    factionId: 'faction-red-dawn',
    rewards: {
      money: 5000,
      funding: 50,
      intel: 80,
      panicReduction: toF6(0.1),
      factionRewards: [
        {
          factionId: 'faction-red-dawn',
          threatReduction: toF6(0.15),
          suppression: toF6(0.15),
        },
      ],
    },
  },
  {
    id: 'mission-raid-red-dawn-hq',
    title: 'Raid cult HQ',
    description: 'Final assault on Red Dawn headquarters.',
    expiresIn: 40,
    dependsOn: ['lead-red-dawn-hq'],
    enemyUnitsSpec: '60 Soldier, 20 Elite, 12 Lieutenant, 6 Commander, 2 HighCommander, 1 CultLeader',
    factionId: 'faction-red-dawn',
    rewards: {
      money: 10_000,
      funding: 100,
      intel: 150,
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
