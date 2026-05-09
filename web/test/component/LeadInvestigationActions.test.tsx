import { describe, test } from 'vitest'
import { st } from '../fixtures/stateFixture'
import { ui } from '../fixtures/uiFixture'

describe('LeadInvestigationActions', () => {
  test("click 'investigate lead' button -> happy path", async () => {
    const leadId = 'lead-criminal-orgs'
    st.arrangeGameState({
      agents: [st.bldAgent('agent-000', 'Standby')],
    })
    st.arrangeSelection({ lead: leadId, agents: ['agent-000'] })

    ui.renderLeadInvestigationActions()
    await ui.investigateLead()

    st.expectLeadInvestigationCreated(leadId)
  })

  test("'investigate lead' button is disabled when no agents selected", () => {
    const leadId = 'lead-criminal-orgs'
    st.arrangeGameState({})
    st.arrangeSelection({ lead: leadId })
    ui.renderLeadInvestigationActions()

    ui.expectInvestigateLeadButtonDisabled()

    st.expectLeadNotInvestigated(leadId)
  })
})
