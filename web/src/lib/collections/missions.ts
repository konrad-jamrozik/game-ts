import { toF6 } from '../primitives/fixed6'
import type { Mission } from '../model/model'
import { assertDefined } from '../primitives/assertPrimitives'
import { factionDefinitions, type FactionDefinition } from './factions'

type MissionTemplate = {
  id: string
  title: string
  description: string
  expiresIn: number | 'never'
  dependsOn: string[]
  enemyUnitsSpec: string
  rewards: {
    money: number
    funding: number
    panicReduction: ReturnType<typeof toF6>
    factionRewards: {
      /**
       * Suppression turns - delays the next faction operation by this many turns.
       */
      suppression: number
    }[]
  }
}

const missionTemplates: MissionTemplate[] = [
  {
    id: 'mission-apprehend-{factionId}-member',
    title: 'Apprehend {factionName} member',
    description: 'Apprehend a member of {factionName}.',
    expiresIn: 3,
    dependsOn: ['lead-{factionId}-location'],
    enemyUnitsSpec: '2 Initiate, 1 Operative',
    rewards: {
      money: 5,
      funding: 0,
      panicReduction: toF6(0.0005),
      factionRewards: [
        {
          suppression: 2, // 2 turns of suppression
        },
      ],
    },
  },
  {
    id: 'mission-raid-{factionId}-safehouse',
    title: 'Raid safehouse',
    description: 'Raid a {factionName} safehouse.',
    expiresIn: 8,
    dependsOn: ['lead-{factionId}-safehouse'],
    enemyUnitsSpec: '4 Initiate, 4 Operative, 1 Handler',
    rewards: {
      money: 100,
      funding: 5,
      panicReduction: toF6(0.001),
      factionRewards: [
        {
          suppression: 5, // 5 turns of suppression
        },
      ],
    },
  },
  {
    id: 'mission-raid-{factionId}-outpost',
    title: 'Raid outpost',
    description: 'Raid a fortified {factionName} outpost.',
    expiresIn: 10,
    dependsOn: ['lead-{factionId}-outpost'],
    enemyUnitsSpec: '8 Initiate, 8 Operative, 2 Soldier, 3 Handler',
    rewards: {
      money: 400,
      funding: 10,
      panicReduction: toF6(0.005),
      factionRewards: [
        {
          suppression: 10, // 10 turns of suppression
        },
      ],
    },
  },
  {
    id: 'mission-raid-{factionId}-trainfac',
    title: 'Raid training facility',
    description: 'Raid a {factionName} training facility.',
    expiresIn: 12,
    dependsOn: ['lead-{factionId}-training-facility'],
    enemyUnitsSpec: '30 Initiate, 16 Operative, 4 Soldier, 6 Handler, 1 Lieutenant',
    rewards: {
      money: 800,
      funding: 15,
      panicReduction: toF6(0.01),
      factionRewards: [
        {
          suppression: 15, // 15 turns of suppression
        },
      ],
    },
  },
  {
    id: 'mission-raid-{factionId}-logistics-hub',
    title: 'Raid logistics hub',
    description: 'Raid a {factionName} logistics hub.',
    expiresIn: 15,
    dependsOn: ['lead-{factionId}-logistics-hub'],
    enemyUnitsSpec: '12 Initiate, 24 Operative, 10 Soldier, 2 Elite, 5 Handler, 2 Lieutenant, 1 Commander',
    rewards: {
      money: 2000,
      funding: 20,
      panicReduction: toF6(0.02),
      factionRewards: [
        {
          suppression: 20, // 20 turns of suppression
        },
      ],
    },
  },
  {
    id: 'mission-raid-{factionId}-command-center',
    title: 'Raid command center',
    description: 'Raid a {factionName} command center.',
    expiresIn: 20,
    dependsOn: ['lead-{factionId}-command-center'],
    enemyUnitsSpec: '20 Operative, 20 Soldier, 6 Elite, 4 Handler, 4 Lieutenant, 3 Commander',
    rewards: {
      money: 3000,
      funding: 25,
      panicReduction: toF6(0.05),
      factionRewards: [
        {
          suppression: 30, // 30 turns of suppression
        },
      ],
    },
  },
  {
    id: 'mission-raid-{factionId}-stronghold',
    title: 'Raid regional stronghold',
    description: 'Raid a {factionName} regional stronghold.',
    expiresIn: 30,
    dependsOn: ['lead-{factionId}-regional-stronghold'],
    enemyUnitsSpec: '40 Soldier, 10 Elite, 8 Lieutenant, 3 Commander, 1 HighCommander',
    rewards: {
      money: 5000,
      funding: 50,
      panicReduction: toF6(0.1),
      factionRewards: [
        {
          suppression: 45, // 45 turns of suppression
        },
      ],
    },
  },
  {
    id: 'mission-raid-{factionId}-hq',
    title: 'Raid HQ',
    description: 'Final assault on {factionName} headquarters.',
    expiresIn: 40,
    dependsOn: ['lead-{factionId}-hq'],
    enemyUnitsSpec: '60 Soldier, 20 Elite, 12 Lieutenant, 6 Commander, 2 HighCommander, 1 CultLeader',
    rewards: {
      money: 10_000,
      funding: 100,
      panicReduction: toF6(0.2),
      factionRewards: [
        {
          suppression: 90, // 90 turns of suppression - essentially defeats the faction
        },
      ],
    },
  },
]

function expandTemplateString(template: string, faction: FactionDefinition): string {
  return template.replaceAll('{factionId}', faction.shortId).replaceAll('{factionName}', faction.name)
}

function generateMissionsForFaction(faction: FactionDefinition): Mission[] {
  return missionTemplates.map((template) => ({
    id: expandTemplateString(template.id, faction),
    title: expandTemplateString(template.title, faction),
    description: expandTemplateString(template.description, faction),
    expiresIn: template.expiresIn,
    dependsOn: template.dependsOn.map((dep) => expandTemplateString(dep, faction)),
    enemyUnitsSpec: template.enemyUnitsSpec,
    factionId: faction.id,
    rewards: {
      ...template.rewards,
      factionRewards: template.rewards.factionRewards.map((fr) => ({
        factionId: faction.id,
        suppression: fr.suppression,
      })),
    },
  }))
}

export const missions: Mission[] = factionDefinitions.flatMap((faction) => generateMissionsForFaction(faction))

export function getMissionById(missionId: string): Mission {
  const foundMission = missions.find((mission) => mission.id === missionId)
  assertDefined(foundMission, `Mission with id ${missionId} not found`)
  return foundMission
}
