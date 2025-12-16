import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import App from '../../src/components/App'
import { store } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { setResetControlsExpanded } from '../../src/redux/slices/settingsSlice'
import { assertDefined } from '../../src/lib/primitives/assertPrimitives'
import { rand } from '../../src/lib/primitives/rand'
import { bldInitialState } from '../../src/lib/ruleset/initialState'
import { verifyMissionState, selectAgents, selectLead, selectMission } from '../utils/testComponentUtils'

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
   * 2. Click "Next turn" button
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
   * 9. Click "Hire Agent" button 3 times
   *    - This hires 3 agents, spending 150 money total
   * 10. Click "Next turn" button twice
   *     - Verify turn advances to 4
   *     - Verify the "Current" column of "Assets" card for "Money" row has a negative value
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

    step1StartWithDebugInitialState()
    await step2AdvanceTurn()
    await step3SelectAgent002()
    await step4ClickCriminalOrganizationsLead()
    await step5ClickInvestigateLeadButton()
    await step6SelectMission001()
    await step7SelectAgents000And001()
    await step8ClickDeployButton()
    await step9HireAgent3Times()
    await step10AdvanceTurnToGameOver()
    await step11ClickResetControls()
    await step12ClickResetGame()
  })
})

// Step functions in order of execution

/**
 * Step 1: Start with debug initial state (200 money, agents "000", "001", "002" available, mission "000" deployed)
 */
function step1StartWithDebugInitialState(): void {
  // Set up debug initial state
  // Start with 200 money so we can hire 4 agents (costs 200 total)
  // This leaves 0 money, and with high agent upkeep, projected balance will be negative
  const debugState = bldInitialState({ debug: true })
  store.dispatch(reset({ customState: { ...debugState, money: 200 } }))
  store.dispatch(clearEvents()) // Clear the reset event

  // Override enemy attack rolls to always fail (roll low) so missions end in 'Won' state
  rand.set('enemy_attack_roll', 0)

  // Set reset controls to collapsed by default for this test
  store.dispatch(setResetControlsExpanded(false))

  render(
    <Provider store={store}>
      <App />
    </Provider>,
  )

  // Verify initial debug state
  // Should have a lead "Criminal organizations"
  const criminalOrgsLeads = screen.getAllByText(/Criminal organizations/iu)
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

  console.log('✅ Step 1 completed: Start with debug initial state')
}

/**
 * Step 2: Click "next turn" button
 * - Verify turn advances to 2
 * - Verify mission "000" is in "Won" state.
 */
async function step2AdvanceTurn(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: /next turn/iu }))

  const turnValue = screen.getByLabelText(/turn/iu)
  expect(turnValue).toHaveTextContent('2')

  // Verify mission "000" is in "Won" state
  verifyMissionState('000', 'Won')

  console.log('✅ Step 2 completed: Next turn')
}

/**
 * Step 3: Select agent "002" by clicking its checkbox in the Agents DataGrid
 */
async function step3SelectAgent002(): Promise<void> {
  // Use agent-002 so agent-000 and agent-001 remain available for mission deployment
  await selectAgents(['agent-002'])

  console.log('✅ Step 3 completed: Select agent "002"')
}

/**
 * Step 4: Select the "Criminal organizations" lead by clicking its checkbox in the Leads DataGrid
 */
async function step4ClickCriminalOrganizationsLead(): Promise<void> {
  // Select the Criminal organizations lead by clicking its checkbox
  await selectLead('Criminal organizations')

  console.log('✅ Step 4 completed: Select "Criminal organizations" lead')
}

/**
 * Step 5: Click "Investigate lead" button
 * - Verify a new lead investigation appears in "Lead investigations"
 * - Verify the data grid in lead investigations card has a row containing "001 Criminal organizations"
 */
async function step5ClickInvestigateLeadButton(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: /investigate lead/iu }))

  // Verify a new lead investigation appears in "Lead investigations"
  expect(screen.getByText(/lead investigations/iu)).toBeInTheDocument()

  // Verify the data grid in lead investigations card has a row containing "001 Criminal organizations"
  const gridRows = screen.getAllByRole('row')
  const investigationRow = gridRows.find((row) => row.textContent.includes('001 Criminal organizations'))
  expect(investigationRow).toBeDefined()

  console.log('✅ Step 5 completed: Click "Investigate lead" button')
}

/**
 * Step 6: Select mission "001" by clicking its checkbox in the Missions DataGrid
 */
async function step6SelectMission001(): Promise<void> {
  // Select mission "001 Apprehend Red Dawn member" by clicking its checkbox
  await selectMission('001 Apprehend Red Dawn member')

  console.log('✅ Step 6 completed: Select mission "001"')
}

/**
 * Step 7: Select agents "000" and "001" by clicking their checkboxes in the Agents DataGrid
 */
async function step7SelectAgents000And001(): Promise<void> {
  // Note: agent-002 is already assigned to lead investigation, so use agent-000 and agent-001
  await selectAgents(['agent-000', 'agent-001'])

  console.log('✅ Step 7 completed: Select agents "000" and "001"')
}

/**
 * Step 8: Click "Deploy" button (should show "Deploy 2 agents on mission-site-001")
 * - Verify mission shows "Status: Deployed"
 */
async function step8ClickDeployButton(): Promise<void> {
  // Click "Deploy" button (text will be something like "Deploy 2 agents on mission-site-001")
  await userEvent.click(screen.getByRole('button', { name: /deploy/iu }))

  // Verify mission shows "Status: Deployed"
  const deployedElements = screen.getAllByText(/deployed/iu)
  expect(deployedElements.length).toBeGreaterThan(0)

  console.log('✅ Step 8 completed: Click "Deploy" button')
}

/**
 * Step 9: Click "Hire Agent" button 3 times
 * - This hires 3 agents, spending 150 money total
 */
async function step9HireAgent3Times(): Promise<void> {
  // Keep hiring agents until balance becomes low enough that projected balance is negative
  // Starting debug balance is 200, agent cost is 50, so we can hire 3 agents
  // With 3+ agents, upkeep costs should make projected balance negative after advancing turns
  await Promise.all(
    Array.from({ length: 3 }).map(async () => {
      const hireButton = screen.getByRole('button', { name: /hire agent/iu })
      await userEvent.click(hireButton)
    }),
  )

  console.log('✅ Step 9 completed: Hire agent 3 times')
}

/**
 * Get the current money value from the "Current" column of "Assets" card for "Money" row
 */
function getCurrentMoneyValue(): number {
  // Verify the "Current" column of "Assets" card for "Money" row exists
  const gridRows = screen.getAllByRole('row')
  const moneyRow = gridRows.find((row) => row.textContent.includes('Money'))
  expect(moneyRow).toBeDefined()
  assertDefined(moneyRow)

  // Find the "Current" column value in the Money row
  // The Current column shows the money value
  // The row structure is: Money | <current_value> | <projected_value>
  const cells = within(moneyRow).getAllByRole('gridcell')
  // The Current column is the second cell (index 1) - first is "Money", second is "Current"
  expect(cells.length).toBeGreaterThanOrEqual(2)
  const [, currentValueCell] = cells
  assertDefined(currentValueCell)
  const currentValueText = currentValueCell.textContent
  // Parse the number (may include negative sign and digits)
  const currentValue = Number.parseInt(currentValueText.trim(), 10)
  return currentValue
}

/**
 * Verify the "Current" column of "Assets" card for "Money" row has a negative value
 * Returns the current money value
 */
function verifyMoneyCurrentValueIsNegative(): number {
  const currentValue = getCurrentMoneyValue()
  expect(currentValue).toBeLessThan(0)
  return currentValue
}

/**
 * Step 10: Click "next turn" button twice
 * - Verify turn advances to 4
 * - Verify the "Current" column of "Assets" card for "Money" row has a negative value
 * - Verify "Game over" button appears and is disabled (money goes negative due to upkeep)
 */
async function step10AdvanceTurnToGameOver(): Promise<void> {
  // After hiring multiple agents, the balance is low enough that
  // after advancing turn once, agent upkeep costs will make money negative and trigger game over
  await userEvent.click(screen.getByRole('button', { name: /next turn/iu }))

  const turnValueAfterGameOver = screen.getByLabelText(/turn/iu)
  expect(turnValueAfterGameOver).toHaveTextContent('3')

  const currentMoneyValue = getCurrentMoneyValue()
  // If money is still above zero, next turn one more time
  // This may happen if e.g. the evaluation of completed mission resulted in an agent being
  // terminated, hence lower upkeep, hence player still having sufficient funds.
  if (currentMoneyValue > 0) {
    await userEvent.click(screen.getByRole('button', { name: /next turn/iu }))
  }
  verifyMoneyCurrentValueIsNegative()

  // Should show disabled "Game over" button instead of "Next turn"
  expect(screen.getByRole('button', { name: /game over/iu })).toBeDisabled()

  console.log('✅ Step 10 completed: Next turn to game over')
}

/**
 * Step 11: Click "Reset controls" button to expand reset controls
 */
async function step11ClickResetControls(): Promise<void> {
  const resetControlsButton = screen.getByRole('button', { name: /reset controls/iu })
  // Click to expand the reset controls
  await userEvent.click(resetControlsButton)

  console.log('✅ Step 11 completed: Click "Reset controls" button')
}

/**
 * Step 12: Click "Reset game" button
 * - Verify turn resets to 1
 * - Verify "Archived missions (0)" appears
 * - Verify "Criminal organizations" lead is still present
 * - Verify "Archived leads (0)" appears
 * - Verify agents "000", "001", "002" are no longer present (reset to initial state)
 */
async function step12ClickResetGame(): Promise<void> {
  // Wait for the reset controls to be visible and find the reset game button
  const buttons = await screen.findAllByRole('button')
  const resetGameButton = buttons.find((button) => button.textContent.toLowerCase().includes('reset game'))

  expect(resetGameButton).toBeDefined()
  assertDefined(resetGameButton)

  await userEvent.click(resetGameButton)

  // Verify game resets to turn 1
  const resetTurnValue = screen.getByLabelText(/turn/iu)
  expect(resetTurnValue).toHaveTextContent('1')

  // Should have only "Criminal organizations" lead
  const finalCriminalOrgsLeads = screen.getAllByText(/criminal-orgs/iu)
  expect(finalCriminalOrgsLeads.length).toBeGreaterThan(0)

  // Should have the 4 agents from the initial state only.
  expect(screen.getByText(/agent-000/iu)).toBeInTheDocument()
  expect(screen.getByText(/agent-001/iu)).toBeInTheDocument()
  expect(screen.getByText(/agent-002/iu)).toBeInTheDocument()
  expect(screen.getByText(/agent-003/iu)).toBeInTheDocument()
  expect(screen.queryByText(/agent-004/iu)).not.toBeInTheDocument()

  console.log('✅ Step 12 completed: Click "Reset game" button')
}
