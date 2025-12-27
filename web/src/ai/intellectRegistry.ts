import { doNothingIntellect } from './intellects/doNothingIntellect'
import { basicIntellect } from './intellects/basicIntellect'
import type { AIPlayerIntellect } from './types'

const intellects: Record<string, AIPlayerIntellect> = {
  'do-nothing': doNothingIntellect,
  basic: basicIntellect,
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
