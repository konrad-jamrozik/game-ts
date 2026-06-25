import { describe, expect, test } from 'vitest'
import { bldInitialState } from '../../src/lib/factories/gameStateFactory'
import { bldLeadInvestigation } from '../../src/lib/factories/leadInvestigationFactory'
import { bldMission } from '../../src/lib/factories/missionFactory'
import type { GameState } from '../../src/lib/model/gameStateModel'
import type { LeadInvestigation } from '../../src/lib/model/leadModel'
import type { Mission } from '../../src/lib/model/missionModel'
import { asLeadId, asMissionDataId, asMissionId } from '../../src/lib/model/modelIds'
import { getWorldEventLogMessages } from '../../src/redux/slices/eventLogWorldEvents'

describe(getWorldEventLogMessages, () => {
  test('reports new mission sites', () => {
    const previousGameState = bldInitialState()
    const mission = bldRedDawnMemberMission({ expiresIn: 5 })
    const gameState = bldState({ missions: [mission] })

    expect(getMessages(previousGameState, gameState)).toContain(
      'New mission site available: Apprehend Red Dawn member. Expires in 5 turns.',
    )
  })

  test('reports active missions expiring in 3 or fewer turns', () => {
    const previousMission = bldRedDawnMemberMission({ expiresIn: 4 })
    const mission = bldRedDawnMemberMission({ expiresIn: 3 })
    const previousGameState = bldState({ missions: [previousMission] })
    const gameState = bldState({ missions: [mission] })

    expect(getMessages(previousGameState, gameState)).toContain('Expires in 3 turns: Apprehend Red Dawn member')
  })

  test('reports mission success and failure', () => {
    const previousWonMission = bldRedDawnMemberMission({ id: 'mission-won', state: 'Deployed' })
    const wonMission = bldRedDawnMemberMission({ id: 'mission-won', state: 'Won' })
    const previousFailedMission = bldRedDawnMemberMission({ id: 'mission-failed', state: 'Deployed' })
    const failedMission = bldRedDawnMemberMission({ id: 'mission-failed', state: 'Retreated' })
    const previousGameState = bldState({ missions: [previousWonMission, previousFailedMission] })
    const gameState = bldState({ missions: [wonMission, failedMission] })

    expect(getMessages(previousGameState, gameState)).toStrictEqual(
      expect.arrayContaining([
        'Mission successful: Apprehend Red Dawn member',
        'Mission failed: Apprehend Red Dawn member',
      ]),
    )
  })

  test('reports investigation completion and abandonment', () => {
    const previousCompletedInvestigation = bldInvestigation('investigation-completed', 'lead-deep-state', 'Active')
    const completedInvestigation = bldInvestigation('investigation-completed', 'lead-deep-state', 'Done')
    const previousAbandonedInvestigation = bldInvestigation('investigation-abandoned', 'lead-criminal-orgs', 'Active')
    const abandonedInvestigation = bldInvestigation('investigation-abandoned', 'lead-criminal-orgs', 'Abandoned')
    const previousGameState = bldState({
      leadInvestigations: {
        [previousCompletedInvestigation.id]: previousCompletedInvestigation,
        [previousAbandonedInvestigation.id]: previousAbandonedInvestigation,
      },
    })
    const gameState = bldState({
      leadInvestigations: {
        [completedInvestigation.id]: completedInvestigation,
        [abandonedInvestigation.id]: abandonedInvestigation,
      },
    })

    expect(getMessages(previousGameState, gameState)).toStrictEqual([
      'Investigation completed: Deep state',
      'Investigation abandoned: Criminal organizations',
      'New one-time lead available: Criminal organizations',
    ])
  })

  test('reports newly available one-time and repeatable leads', () => {
    const previousGameState = bldInitialState()
    const apprehendMission = bldRedDawnMemberMission({ state: 'Won' })
    const gameState = bldState({
      leadInvestigationCounts: { 'lead-criminal-orgs': 1 },
      missions: [apprehendMission],
    })

    expect(getMessages(previousGameState, gameState)).toStrictEqual(
      expect.arrayContaining([
        'New repeatable lead available: Locate Red Dawn member',
        'New one-time lead available: Interrog. Red Dawn member',
      ]),
    )
  })
})

function getMessages(previousGameState: GameState, gameState: GameState): string[] {
  return getWorldEventLogMessages(previousGameState, gameState).map((event) => event.message)
}

function bldState(overrides: Partial<GameState>): GameState {
  return {
    ...bldInitialState(),
    ...overrides,
  }
}

function bldRedDawnMemberMission(overrides: Partial<Mission> = {}): Mission {
  return bldMission({
    id: asMissionId(overrides.id ?? 'mission-red-dawn-member'),
    missionDataId: asMissionDataId('missiondata-apprehend-red-dawn-member'),
    turnDiscovered: 1,
    ...overrides,
  })
}

function bldInvestigation(
  id: LeadInvestigation['id'],
  leadId: LeadInvestigation['leadId'],
  state: LeadInvestigation['state'],
): LeadInvestigation {
  return bldLeadInvestigation({
    id,
    leadId: asLeadId(leadId),
    actualDifficulty: 1,
    state,
  })
}
