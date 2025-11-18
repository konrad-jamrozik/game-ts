import { screen, within } from '@testing-library/react'
import { expect } from 'vitest'
import { assertDefined } from '../../src/lib/utils/assert'

export function verifyMissionState(missionId: string, expectedState: string): void {
  // Verify mission "000" is in "Successful" state
  // Find the row containing mission site ID "000"
  const gridRows = screen.getAllByRole('row')
  const missionRowWithStateCell = gridRows.find((row) => {
    // Check if this row contains "000" in its text content (mission site ID)
    // and has a state cell (indicating it's a mission row)
    const hasMissionId = row.textContent?.includes(missionId) ?? false
    const hasStateCell = within(row).queryByLabelText(/missions-row-state-/iu) !== null
    return hasMissionId && hasStateCell
  })
  expect(missionRowWithStateCell).toBeDefined()
  assertDefined(missionRowWithStateCell)

  // Find the state cell for this row and verify it contains "Successful"
  const stateCell = within(missionRowWithStateCell).getByLabelText(/missions-row-state-/iu)
  expect(stateCell).toHaveTextContent(expectedState)
}
