import type { AIPlayerIntellect, AIPlayerIntellectV2, PlayTurnAPI } from '../types'

export const doNothingIntellect: AIPlayerIntellect = {
  name: 'Do Nothing',
  playTurn: () => {
    // Does nothing, just returns
  },
}

export const doNothingIntellectV2: AIPlayerIntellectV2 = {
  name: 'Do Nothing',
  playTurn(_api: PlayTurnAPI): void {
    // Does nothing, just returns
  },
}
