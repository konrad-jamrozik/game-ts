import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { assertDefined } from '../../src/lib/utils/assert'

export function verifyMissionState(missionId: string, expectedState: string): void {
  // Verify mission is in the expected state
  // Find the row containing the mission ID
  const missionRow = findRowById(missionId)
  expect(missionRow).toBeDefined()
  assertDefined(missionRow)

  // Verify this row has a state cell (indicating it's a mission row)
  const hasStateCell = within(missionRow).queryByLabelText(/missions-row-state-/iu) !== null
  expect(hasStateCell).toBe(true)

  // Find the state cell for this row and verify it contains the expected state
  const stateCell = within(missionRow).getByLabelText(/missions-row-state-/iu)
  expect(stateCell).toHaveTextContent(expectedState)
}

export async function selectAgents(agentIds: string[]): Promise<void> {
  // Find and click checkboxes for the specified agent IDs in the Agents DataGrid
  const agentCheckboxes: HTMLElement[] = []

  for (const agentId of agentIds) {
    // Find the row that contains this agent ID
    const targetRow = findRowById(agentId)
    if (targetRow) {
      // Use within() to scope the checkbox query to this specific row
      const checkbox = within(targetRow).getByRole('checkbox')
      agentCheckboxes.push(checkbox)
    }
  }

  // Click the agent checkboxes we found
  await Promise.all(agentCheckboxes.map(async (checkbox) => userEvent.click(checkbox)))
}

function findRowById(id: string): HTMLElement | undefined {
  // Find all grid rows and return the row that contains the specified ID
  const gridRows = screen.getAllByRole('row')
  return gridRows.find((row) => row.textContent?.includes(id) ?? false)
}
