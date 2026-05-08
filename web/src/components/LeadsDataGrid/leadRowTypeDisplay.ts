export function leadRowTypeDisplay(repeatable: boolean): 'Repeat.' | 'One-time' {
  return repeatable ? 'Repeat.' : 'One-time'
}
