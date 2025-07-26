export function assertDefined<T>(
  value: T,
  errMsg = 'Value must be defined (not null or undefined)',
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(errMsg)
  }
}
