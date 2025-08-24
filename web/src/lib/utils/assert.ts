export function assertDefined<T>(
  value: T,
  errMsg = 'Value must be defined (not null or undefined)',
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(errMsg)
  }
}

export function assertEqual<T>(left: T, right: T, errMsg = 'Values must be equal'): asserts left is T & NonNullable<T> {
  if (left !== right) {
    throw new Error(errMsg)
  }
}

export function assertOneOf<T>(
  value: T,
  validValues: readonly T[],
  errMsg = 'Value must be one of the valid options',
): asserts value is T & NonNullable<T> {
  if (!validValues.includes(value)) {
    throw new Error(errMsg)
  }
}

export function assertUnreachable(value: never): never {
  throw new Error(`Unreachable code reached. Received: ${JSON.stringify(value)}`)
}
