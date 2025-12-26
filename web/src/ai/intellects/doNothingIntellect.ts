import type { AIPlayerIntellect, PlayTurnAPI } from '../types'

export const doNothingIntellect: AIPlayerIntellect = {
  name: 'Do Nothing',
  playTurn(_api: PlayTurnAPI): void {
    // Does nothing, just returns
  },
}
