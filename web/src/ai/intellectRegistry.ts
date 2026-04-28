import { doNothingIntellect } from './intellects/doNothingIntellect'
import { basicIntellect } from './intellects/basic/basicIntellect'
import { cheatingSpeedrunnerIntellect } from './intellects/cheatingSpeedrunner/cheatingSpeedrunnerIntellect'
import type { AIPlayerIntellect } from './types'

const intellects: Record<string, AIPlayerIntellect> = {
  'do-nothing': doNothingIntellect,
  basic: basicIntellect,
  'cheating-speedrunner': cheatingSpeedrunnerIntellect,
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
