import { basicIntellect } from './intellects/basicIntellect'
import { doNothingIntellect, doNothingIntellectV2 } from './intellects/doNothingIntellect'
import type { AIPlayerIntellect, AIPlayerIntellectV2 } from './types'

const intellects: Record<string, AIPlayerIntellect> = {
  'do-nothing': doNothingIntellect,
  basic: basicIntellect,
}

const intellectsV2: Record<string, AIPlayerIntellectV2> = {
  'do-nothing': doNothingIntellectV2,
}

export function getIntellect(name: string): AIPlayerIntellect {
  const intellect = intellects[name]
  if (!intellect) {
    throw new Error(`Intellect "${name}" not found`)
  }
  return intellect
}

export function getIntellectV2(name: string): AIPlayerIntellectV2 {
  const intellect = intellectsV2[name]
  if (!intellect) {
    throw new Error(`Intellect "${name}" not found`)
  }
  return intellect
}

export function getAllIntellectNames(): string[] {
  return Object.keys(intellects)
}

export function getAllIntellectNamesV2(): string[] {
  return Object.keys(intellectsV2)
}
