import type { AIPlayerIntellect } from '../types'

export const doNothingIntellect: AIPlayerIntellect = {
  name: 'Do Nothing',
  playTurn: () => {
    // Does nothing, just returns
  },
}
