/**
 * A logger that can be controlled via UI checkboxes.
 * Categories are enabled/disabled via syncAll() called from React components.
 * This follows the same pattern as rand.ts - internal state synced from Redux via React layer.
 */

import { LOG_CATEGORIES, type LogCategory, isLogCategory } from './logCategories'

function buildStyle(color: string): string {
  return `background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`
}

function newLogger(): {
  readonly setEnabled: (category: LogCategory, enabled: boolean) => void
  readonly syncAll: (settings: Partial<Record<LogCategory, boolean>>) => void
  readonly info: (category: LogCategory, message: string, ...args: unknown[]) => void
  readonly success: (category: LogCategory, message: string) => void
  readonly warn: (category: LogCategory, message: string, ...args: unknown[]) => void
  readonly group: (category: LogCategory, label: string, fn: () => void) => void
  readonly table: (category: LogCategory, label: string, data: unknown) => void
} {
  const enabledCategories = new Map<LogCategory, boolean>()

  function isEnabled(category: LogCategory): boolean {
    return enabledCategories.get(category) ?? false
  }

  return {
    setEnabled(category: LogCategory, enabled: boolean): void {
      enabledCategories.set(category, enabled)
    },

    syncAll(settings: Partial<Record<LogCategory, boolean>>): void {
      for (const [category, enabled] of Object.entries(settings)) {
        if (isLogCategory(category)) {
          enabledCategories.set(category, enabled)
        }
      }
    },

    info(category: LogCategory, message: string, ...args: unknown[]): void {
      if (!isEnabled(category)) return
      const { badge, color } = LOG_CATEGORIES[category]
      console.log(`%c${badge}`, buildStyle(color), message, ...args)
    },

    success(category: LogCategory, message: string): void {
      if (!isEnabled(category)) return
      const { badge, color } = LOG_CATEGORIES[category]
      console.log(`%c${badge}%c ✅ ${message}`, buildStyle(color), 'color: #4CAF50; font-weight: bold;')
    },

    warn(category: LogCategory, message: string, ...args: unknown[]): void {
      if (!isEnabled(category)) return
      const { badge, color } = LOG_CATEGORIES[category]
      console.warn(`%c${badge}`, buildStyle(color), message, ...args)
    },

    group(category: LogCategory, label: string, fn: () => void): void {
      if (!isEnabled(category)) return
      const { badge, color } = LOG_CATEGORIES[category]
      console.groupCollapsed(`%c${badge}`, buildStyle(color), label)
      fn()
      console.groupEnd()
    },

    table(category: LogCategory, label: string, data: unknown): void {
      if (!isEnabled(category)) return
      const { badge, color } = LOG_CATEGORIES[category]
      console.log(`%c${badge}`, buildStyle(color), label)
      console.table(data)
    },
  } as const
}

export const log = newLogger()
