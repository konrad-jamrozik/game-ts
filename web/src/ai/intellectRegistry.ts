import { doNothingIntellect } from './intellects/doNothingIntellect'
import type { AIPlayerIntellect } from './types'

const intellects: Record<string, AIPlayerIntellect> = {
  'do-nothing': doNothingIntellect,
}

export function getIntellect(name: string): AIPlayerIntellect {
  const intellect = intellects[name]
  if (!intellect) {
    throw new Error(`Intellect "${name}" not found`)
  }
  return intellect
}

export function getAllIntellectNames(): string[] {
  return Object.keys(intellects)
}
