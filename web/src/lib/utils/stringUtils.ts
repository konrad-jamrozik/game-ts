import { assertNotNaN } from './assert'

// Extract numeric suffix from IDs.
// Handles formats:
// - "enemy-initiate-123" -> 123
// - "agent-011" -> 11
export function extractNumberFromId(id: string): number {
  const regex = /-(?<number>\d+)$/u
  const match = regex.exec(id)
  const numberStr = match?.groups?.['number']
  if (numberStr === undefined || numberStr === '') {
    return Number.NaN
  }
  return Number.parseInt(numberStr, 10)
}

export function compareIdsNumeric(idA: string, idB: string): number {
  const numA = extractNumberFromId(idA)
  const numB = extractNumberFromId(idB)

  // Both IDs must have numeric suffixes for numeric comparison
  if (Number.isNaN(numA)) {
    assertNotNaN(
      numA,
      `Failed to extract numeric ID from "${idA}" (extracted: ${numA}). ID must have a numeric suffix.`,
    )
  }
  if (Number.isNaN(numB)) {
    assertNotNaN(
      numB,
      `Failed to extract numeric ID from "${idB}" (extracted: ${numB}). ID must have a numeric suffix.`,
    )
  }

  return numA - numB
}
