import type { PlayTurnAPI } from '../lib/model_utils/playTurnApiTypes'

export type AIPlayerIntellect = {
  name: string
  playTurn(api: PlayTurnAPI): void
}
