import type { AIPlayerIntellect } from '../types'
import type { PlayTurnAPI } from '../../lib/model_utils/playTurnApiTypes'

export const doNothingIntellect: AIPlayerIntellect = {
  name: 'Do Nothing',
  playTurn(_api: PlayTurnAPI): void {
    // Does nothing, just returns
  },
}
