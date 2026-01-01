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
  enabled = false
  private currentTurn = 0
  private data: Map<number, TurnData> = new Map()

  startTurn(turn: number): void {
    this.currentTurn = turn
    // Initialize turn data if it doesn't exist
    if (!this.data.has(turn)) {
      this.data.set(turn, new Map())
    }
  }

  wrap<T extends (...args: any[]) => any>(name: string, fn: T): T {
    if (!this.enabled) {
      // Return original function when disabled (zero overhead)
      return fn
    }

    const wrapped = ((...args: Parameters<T>) => {
      const start = performance.now()
      const result = fn(...args)
      const end = performance.now()
      const duration = end - start

      this.recordCall(name, duration)
      return result
    }) as T

    return wrapped
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

  generateCSV(): string {
    // Collect all function names across all turns
    const functionNames = new Set<string>()
    for (const turnData of this.data.values()) {
      for (const functionName of turnData.keys()) {
        functionNames.add(functionName)
      }
    }

    const sortedFunctionNames = Array.from(functionNames).sort()

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
    const sortedTurns = Array.from(this.data.keys()).sort((a, b) => a - b)
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
          const sortedDurations = [...stats.durations].sort((a, b) => a - b)
          const min = sortedDurations[0]!
          const max = sortedDurations[sortedDurations.length - 1]!
          const sum = sortedDurations.reduce((acc, d) => acc + d, 0)
          const avg = sum / sortedDurations.length
          const p90Index = Math.ceil(sortedDurations.length * 0.9) - 1
          const p90 = sortedDurations[Math.max(0, p90Index)]!

          rowParts.push(stats.calls.toString(), min.toFixed(3), avg.toFixed(3), p90.toFixed(3), max.toFixed(3))
        }
      }

      rows.push(rowParts.join(','))
    }

    return rows.join('\n')
  }

  reset(): void {
    this.currentTurn = 0
    this.data.clear()
  }
}

export const profiler = new Profiler()
