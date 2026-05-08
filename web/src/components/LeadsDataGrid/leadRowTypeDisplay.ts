export function leadRowTypeDisplay(repeatable: boolean): 'Repeatable' | 'One-time' {
  return repeatable ? 'Repeatable' : 'One-time'
}
