/**
 * Global debug configuration for controlling various debug behaviors.
 */

export const debugConfig = {
  /** 0 = disabled, 1 = every turn, N = every N turns */
  gameStateInvariantsFrequency: 1,

  setGameStateInvariantsFrequency(value: number): void {
    this.gameStateInvariantsFrequency = value
  },

  reset(): void {
    this.gameStateInvariantsFrequency = 1
  },
}
