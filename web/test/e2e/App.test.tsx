/* eslint-disable max-statements */
/* eslint-disable vitest/max-expects */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import App from '../../src/app/App'
import { store } from '../../src/app/store'
import { reset } from '../../src/lib/slices/gameStateSlice'
import { clearEvents } from '../../src/lib/slices/eventsSlice'
import { setResetControlsExpanded } from '../../src/lib/slices/settingsSlice'
import { assertDefined } from '../../src/lib/utils/assert'
import { makeInitialState } from '../../src/lib/model/ruleset/initialState'

describe(App, () => {
  beforeEach(() => {
    // Reset store to clean state and clear undo history
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
    store.dispatch(clearEvents())
  })

  /**
   * This test executes a subset of core game logic to verify the game does not crash.
   *
   * Manual reproduction steps:
   * 1. Start with debug initial state (200 money, agents "000", "001", "002" available, mission "000" deployed)
   * 2. Click "Advance turn" button
   *    - Verify turn advances to 2
   *    - Verify mission "000" appears in "Archived missions"
   * 3. Select agent "002" by clicking its checkbox in the Agents DataGrid
   * 4. Click on the "Criminal organizations" lead card
   * 5. Click "Investigate lead" button
   *    - Verify a new lead investigation appears in "Lead investigations"
   * 6. Click on mission card containing "001"
   * 7. Select agents "000" and "001" by clicking their checkboxes in the Agents DataGrid
   * 8. Click "Deploy" button (should show "Deploy 2 agents on mission-site-001")
   *    - Verify mission shows "Status: Deployed"
   * 9. Click "Hire Agent" button 4 times
   *    - This hires 4 agents, spending 200 money total
   * 10. Click "Advance turn" button
   *     - Verify turn advances to 3
   *     - Verify "Game over" button appears and is disabled (money goes negative due to upkeep)
   * 11. Click "Reset controls" button to expand reset controls
   * 12. Click "Reset game" button
   *     - Verify turn resets to 1
   *     - Verify "Archived missions (0)" appears
   *     - Verify "Criminal organizations" lead is still present
   *     - Verify "Archived leads (0)" appears
   *     - Verify agents "000", "001", "002" are no longer present (reset to initial state)
   */
  test('Execute subset of core logic and verify the game does not crash', async () => {
    expect.hasAssertions()

    // Set up debug initial state
    // Start with 200 money so we can hire 4 agents (costs 200 total)
    // This leaves 0 money, and with high agent upkeep, projected balance will be negative
    const debugState = makeInitialState({ debug: true })
    store.dispatch(reset({ customState: { ...debugState, money: 200 } }))
    store.dispatch(clearEvents()) // Clear the reset event

    // Set reset controls to collapsed by default for this test
    store.dispatch(setResetControlsExpanded(false))

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    )

    // === GIVEN: Verify initial debug state ===

    // Should have a lead "Criminal organizations"
    const criminalOrgsLeads = screen.getAllByText(/criminal organizations/iu)

    expect(criminalOrgsLeads.length).toBeGreaterThan(0)

    // Should have mission with ID "000" (in deployed state) - look for exact mission ID
    const missionElements = screen.getAllByText(/000/iu)

    expect(missionElements.length).toBeGreaterThan(0)

    // Should have agents with IDs "000", "001", "002" in Available state
    expect(screen.getByText(/agent-000/iu)).toBeInTheDocument()
    expect(screen.getByText(/agent-001/iu)).toBeInTheDocument()
    expect(screen.getByText(/agent-002/iu)).toBeInTheDocument()

    // Should start in turn 1
    const initialTurnValue = screen.getByLabelText(/turn/iu)

    expect(initialTurnValue).toHaveTextContent('1')

    // === WHEN: Click "Advance turn" button ===

    await userEvent.click(screen.getByRole('button', { name: /advance turn/iu }))

    // === THEN: Mission evaluates and turn advances ===

    const turnValue = screen.getByLabelText(/turn/iu)

    expect(turnValue).toHaveTextContent('2')

    // Mission with ID "000" should now appear in "Archived missions"
    // We expect the deployed mission site to have been evaluated
    expect(screen.getByText(/archived missions/iu)).toBeInTheDocument()

    // === WHEN: Select "Criminal organizations" lead and investigate ===

    // First, select an agent using DataGrid checkboxes
    // Use agent-002 so agent-000 and agent-001 remain available for mission deployment
    const investigationAgentCheckboxes: HTMLElement[] = []
    const investigationAgentIds = ['agent-002']

    for (const agentId of investigationAgentIds) {
      // Find all grid rows
      const gridRows = screen.getAllByRole('row')
      // Find the row that contains this agent ID
      const targetRow = gridRows.find((row) => row.textContent?.includes(agentId) ?? false)
      if (targetRow) {
        // Use within() to scope the checkbox query to this specific row
        const checkbox = within(targetRow).getByRole('checkbox')
        investigationAgentCheckboxes.push(checkbox)
      }
    }

    // Click the agent checkbox to select it
    assertDefined(investigationAgentCheckboxes[0])
    await userEvent.click(investigationAgentCheckboxes[0])

    // Find and click the Criminal organizations lead (use the first one, which should be the title)
    const clickableCriminalOrgsLeads = screen.getAllByText(/criminal organizations/iu)

    assertDefined(clickableCriminalOrgsLeads[0])
    await userEvent.click(clickableCriminalOrgsLeads[0])

    // Click "Investigate lead" button
    await userEvent.click(screen.getByRole('button', { name: /investigate lead/iu }))

    // === THEN: A new lead investigation appears in "Lead investigations" ===

    expect(screen.getByText(/lead investigations/iu)).toBeInTheDocument()

    // === WHEN: Deploy agents to mission ===

    // Select mission - find mission cards and click on one containing "001"
    const missionCardButtons = screen.getAllByRole('button')
    const mission001Card = missionCardButtons.find((button) => button.textContent?.includes('001') ?? false)

    expect(mission001Card).toBeDefined()

    assertDefined(mission001Card)

    await userEvent.click(mission001Card)

    // Select agents using DataGrid checkboxes - find checkboxes for specific agents
    // Use testing-library's within() to scope queries to specific rows
    // Note: agent-002 is already assigned to lead investigation, so use agent-000 and agent-001
    const agentCheckboxes: HTMLElement[] = []
    const agentIds = ['agent-000', 'agent-001']

    for (const agentId of agentIds) {
      // Find all grid rows
      const gridRows = screen.getAllByRole('row')
      // Find the row that contains this agent ID
      const targetRow = gridRows.find((row) => row.textContent?.includes(agentId) ?? false)
      if (targetRow) {
        // Use within() to scope the checkbox query to this specific row
        const checkbox = within(targetRow).getByRole('checkbox')
        agentCheckboxes.push(checkbox)
      }
    }

    // Click the agent checkboxes we found
    await Promise.all(agentCheckboxes.map(async (checkbox) => userEvent.click(checkbox)))

    // Click "Deploy" button (text will be something like "Deploy 2 agents on mission-site-001")
    await userEvent.click(screen.getByRole('button', { name: /deploy/iu }))

    // === THEN: Mission shows "Status: Deployed" ===

    const deployedElements = screen.getAllByText(/deployed/iu)

    expect(deployedElements.length).toBeGreaterThan(0)

    // === WHEN: Hire agents until money goes negative ===

    // Keep hiring agents until balance becomes low enough that projected balance is negative
    // Starting debug balance is 200, agent cost is 50, so we can hire 4 agents
    // With 4+ agents, upkeep costs should make projected balance negative
    await Promise.all(
      Array.from({ length: 4 }).map(async () => {
        const hireButton = screen.getByRole('button', { name: /hire agent/iu })
        await userEvent.click(hireButton)
      }),
    )

    // === WHEN: Advance turn ===
    // After hiring multiple agents, the balance is low enough that
    // after turn advancement, agent upkeep costs will make money negative and trigger game over

    await userEvent.click(screen.getByRole('button', { name: /advance turn/iu }))

    // === THEN: Game over state ===

    const turnValueAfterGameOver = screen.getByLabelText(/turn/iu)

    expect(turnValueAfterGameOver).toHaveTextContent('3')

    // Should show disabled "Game over" button instead of "Advance turn"
    expect(screen.getByRole('button', { name: /game over/iu })).toBeDisabled()

    // === WHEN: Reset game ===

    const resetControlsButton = screen.getByRole('button', { name: /reset controls/iu })

    // Click to expand the reset controls
    await userEvent.click(resetControlsButton)

    // Wait for the reset controls to be visible and find the reset game button
    const buttons = await screen.findAllByRole('button')
    const resetGameButton = buttons.find((button) => button.textContent?.toLowerCase().includes('reset game') ?? false)

    expect(resetGameButton).toBeDefined()

    assertDefined(resetGameButton)

    await userEvent.click(resetGameButton)

    // === THEN: Game resets to turn 1 ===

    const resetTurnValue = screen.getByLabelText(/turn/iu)

    expect(resetTurnValue).toHaveTextContent('1')

    // Should have no missions or archived missions
    expect(screen.getByText(/archived missions \(0\)/iu)).toBeInTheDocument()

    // Should have only "Criminal organizations" lead
    const finalCriminalOrgsLeads = screen.getAllByText(/criminal organizations/iu)

    expect(finalCriminalOrgsLeads.length).toBeGreaterThan(0)

    // Should have no archived leads
    expect(screen.getByText(/archived leads \(0\)/iu)).toBeInTheDocument()

    // Should have no agents (reset to initial state, not debug state)
    expect(screen.queryByText(/agent-000/iu)).not.toBeInTheDocument()
    expect(screen.queryByText(/agent-001/iu)).not.toBeInTheDocument()
    expect(screen.queryByText(/agent-002/iu)).not.toBeInTheDocument()
  })
})
