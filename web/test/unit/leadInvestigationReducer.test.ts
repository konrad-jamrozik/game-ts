import { describe, expect, test } from 'vitest'
import gameStateReducer, { startLeadInvestigation } from '../../src/redux/slices/gameStateSlice'
import { bldInitialState } from '../../src/lib/factories/gameStateFactory'
import { asAgentId, asLeadId } from '../../src/lib/model/modelIds'
import { rand } from '../../src/lib/primitives/rand'

describe(startLeadInvestigation, () => {
  test('stores deterministic integer actual difficulty when investigation starts', () => {
    rand.set('lead-actual-difficulty', 1)

    const state = gameStateReducer(
      bldInitialState(),
      startLeadInvestigation({
        leadId: asLeadId('lead-deep-state'),
        agentIds: [asAgentId('agent-000')],
      }),
    )

    const investigation = state.leadInvestigations['investigation-000']
    expect(investigation?.progress).toBe(0)
    expect(investigation?.actualDifficulty).toBe(15)

    rand.reset('lead-actual-difficulty')
  })
})
