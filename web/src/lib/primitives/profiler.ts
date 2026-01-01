/**
 * Lightweight function profiler for collecting per-turn timing statistics.
 *
 * Usage:
 *   1. Wrap functions: export const myFunc = profiler.wrap('myFunc', myFuncImpl)
 *   2. Enable profiling: profiler.enabled = true
 *   3. Mark turn boundaries: profiler.startTurn(turnNumber)
 *   4. Generate CSV: profiler.generateCSV()
 */

type FunctionStats = {
  calls: number
  durations: number[] // Store all for p90 calculation
}

type TurnData = Map<string, FunctionStats>

class Profiler {
  public enabled = false
  private currentTurn = 0
  private readonly data = new Map<number, TurnData>()

  public startTurn(turn: number): void {
    this.currentTurn = turn
    // Initialize turn data if it doesn't exist
    if (!this.data.has(turn)) {
      this.data.set(turn, new Map())
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public wrap<T extends (...args: any[]) => any>(name: string, fn: T): T {
    // Note: We check `enabled` at call time, not at wrap time.
    // This is because `wrap()` is called at module load time,
    // but `enabled` is set later in the profiling script.
    const recordCallBound = this.recordCall.bind(this)
    const isEnabledBound = this.isEnabled.bind(this)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion
    return ((...args: Parameters<T>): any => {
      if (!isEnabledBound()) {
        return fn(...args)
      }

      const start = performance.now()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = fn(...args)
      const end = performance.now()
      const duration = end - start

      recordCallBound(name, duration)
      return result
    }) as T
  }

  public generateCSV(): string {
    // Collect all function names across all turns
    const functionNames = new Set<string>()
    for (const turnData of this.data.values()) {
      for (const functionName of turnData.keys()) {
        functionNames.add(functionName)
      }
    }

    const sortedFunctionNames = [...functionNames].toSorted()

    // Build header row
    const headerParts: string[] = ['Turn']
    for (const functionName of sortedFunctionNames) {
      headerParts.push(
        `${functionName} calls`,
        `${functionName} min ms`,
        `${functionName} avg ms`,
        `${functionName} p90 ms`,
        `${functionName} max ms`,
      )
    }
    const header = headerParts.join(',')

    // Build data rows
    const sortedTurns = [...this.data.keys()].toSorted((a, b) => a - b)
    const rows: string[] = [header]

    for (const turn of sortedTurns) {
      const turnData = this.data.get(turn)
      if (turnData === undefined) {
        continue
      }

      const rowParts: string[] = [turn.toString()]

      for (const functionName of sortedFunctionNames) {
        const stats = turnData.get(functionName)
        if (stats === undefined || stats.calls === 0) {
          // No calls for this function in this turn
          rowParts.push('0', '', '', '', '')
        } else {
          const sortedDurations = [...stats.durations].toSorted((a, b) => a - b)
          const min = sortedDurations.at(0) ?? 0
          const max = sortedDurations.at(-1) ?? 0
          const sum = sortedDurations.reduce((acc, d) => acc + d, 0)
          const avg = sum / sortedDurations.length
          const p90Index = Math.ceil(sortedDurations.length * 0.9) - 1
          const p90 = sortedDurations.at(Math.max(0, p90Index)) ?? 0

          rowParts.push(stats.calls.toString(), min.toFixed(3), avg.toFixed(3), p90.toFixed(3), max.toFixed(3))
        }
      }

      rows.push(rowParts.join(','))
    }

    return rows.join('\n')
  }

  public reset(): void {
    this.currentTurn = 0
    this.data.clear()
  }

  private isEnabled(): boolean {
    return this.enabled
  }

  private recordCall(functionName: string, duration: number): void {
    const turnData = this.data.get(this.currentTurn)
    if (turnData === undefined) {
      // Turn not initialized - skip recording
      return
    }

    const stats = turnData.get(functionName)
    if (stats === undefined) {
      turnData.set(functionName, {
        calls: 1,
        durations: [duration],
      })
    } else {
      stats.calls += 1
      stats.durations.push(duration)
    }
  }
}

export const profiler = new Profiler()
