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

  private static abbreviateName(name: string): string {
    // Split camelCase/PascalCase into words by detecting capital letters
    const words: string[] = []
    let currentWord = ''
    for (const char of name) {
      if (char >= 'A' && char <= 'Z' && currentWord.length > 0) {
        // Capital letter starts a new word
        words.push(currentWord)
        currentWord = char
      } else {
        currentWord += char
      }
    }
    if (currentWord.length > 0) {
      words.push(currentWord)
    }

    // Take first 2 characters of each word
    return words.map((word) => word.slice(0, 2)).join('')
  }

  private static getHeaderName(functionName: string): string {
    // Default: abbreviate the name
    // return Profiler.abbreviateName(functionName)
    return functionName
  }

  private static sortFunctionNames(functionNames: string[]): string[] {
    const aiName = 'delegateTurnToAIPlayer'
    const advTName = 'dispatchAdvanceTurn'

    const aiIndex = functionNames.indexOf(aiName)
    const advTIndex = functionNames.indexOf(advTName)

    const others = functionNames.filter((name) => name !== aiName && name !== advTName)
    const sortedOthers = others.toSorted((a, b) => {
      const abbrevA = Profiler.abbreviateName(a)
      const abbrevB = Profiler.abbreviateName(b)
      return abbrevA.localeCompare(abbrevB)
    })

    const result: string[] = []
    if (aiIndex !== -1) {
      result.push(aiName)
    }
    if (advTIndex !== -1) {
      result.push(advTName)
    }
    result.push(...sortedOthers)

    return result
  }

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

    // Use computed property name with method shorthand to create a function
    // with a dynamic name that V8's profiler will recognize.
    // Object.defineProperty on .name doesn't update V8's internal debug name.
    const wrapperName = `_P_${name}`
    const { [wrapperName]: wrapper } = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [wrapperName](...args: Parameters<T>): any {
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
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return wrapper as T
  }

  public generateCSV(): string {
    // Collect all function names across all turns
    const functionNames = new Set<string>()
    for (const turnData of this.data.values()) {
      for (const functionName of turnData.keys()) {
        functionNames.add(functionName)
      }
    }

    // Sort functions: AI first, AdvT second, then alphabetically by abbreviated name
    const sortedFunctionNames = Profiler.sortFunctionNames([...functionNames])

    // Build header row - group by metric type first, then by function
    const headerParts: string[] = ['Turn']
    // First all 'tot' columns
    for (const functionName of sortedFunctionNames) {
      const headerName = Profiler.getHeaderName(functionName)
      headerParts.push(`${headerName} tot`)
    }
    // Then all 'cnt' columns
    for (const functionName of sortedFunctionNames) {
      const headerName = Profiler.getHeaderName(functionName)
      headerParts.push(`${headerName} cnt`)
    }
    // Then all 'avg' columns
    for (const functionName of sortedFunctionNames) {
      const headerName = Profiler.getHeaderName(functionName)
      headerParts.push(`${headerName} avg`)
    }
    // Finally all 'max' columns
    for (const functionName of sortedFunctionNames) {
      const headerName = Profiler.getHeaderName(functionName)
      headerParts.push(`${headerName} max`)
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

      // Collect stats for all functions first
      const functionStats = new Map<string, { calls: number; avg: number; max: number; tot: number }>()
      for (const functionName of sortedFunctionNames) {
        const stats = turnData.get(functionName)
        if (stats === undefined || stats.calls === 0) {
          functionStats.set(functionName, { calls: 0, avg: 0, max: 0, tot: 0 })
        } else {
          const sortedDurations = [...stats.durations].toSorted((a, b) => a - b)
          const max = sortedDurations.at(-1) ?? 0
          const sum = sortedDurations.reduce((acc, d) => acc + d, 0)
          const avg = sum / sortedDurations.length
          const tot = sum
          functionStats.set(functionName, { calls: stats.calls, avg, max, tot })
        }
      }

      // Add columns grouped by metric type: tot, cnt, avg, max
      // First all 'tot' values
      for (const functionName of sortedFunctionNames) {
        const stats = functionStats.get(functionName) ?? { calls: 0, avg: 0, max: 0, tot: 0 }
        rowParts.push(stats.tot === 0 ? '' : stats.tot.toFixed(0))
      }
      // Then all 'cnt' values
      for (const functionName of sortedFunctionNames) {
        const stats = functionStats.get(functionName) ?? { calls: 0, avg: 0, max: 0, tot: 0 }
        rowParts.push(stats.calls === 0 ? '0' : stats.calls.toString())
      }
      // Then all 'avg' values
      for (const functionName of sortedFunctionNames) {
        const stats = functionStats.get(functionName) ?? { calls: 0, avg: 0, max: 0, tot: 0 }
        rowParts.push(stats.avg === 0 ? '' : stats.avg.toFixed(0))
      }
      // Finally all 'max' values
      for (const functionName of sortedFunctionNames) {
        const stats = functionStats.get(functionName) ?? { calls: 0, avg: 0, max: 0, tot: 0 }
        rowParts.push(stats.max === 0 ? '' : stats.max.toFixed(0))
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
