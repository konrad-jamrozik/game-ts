export const LOG_CATEGORIES = {
  ai: { badge: '🤖 AI', color: '#9c27b0' },
  combat: { badge: '⚔️ Combat', color: '#f44336' },
  missions: { badge: '🎯 Missions', color: '#2196f3' },
  agents: { badge: '👤 Agents', color: '#4caf50' },
  purchasing: { badge: '💰 Purchasing', color: '#ff9800' },
  'lead-investigation': { badge: '🔍 Leads', color: '#00bcd4' },
  'turn-advancement': { badge: '⏭️ Turn', color: '#673ab7' },
  persistence: { badge: '💾 Persist', color: '#607d8b' },
  general: { badge: '📝 Log', color: '#9e9e9e' },
} as const

export type LogCategory = keyof typeof LOG_CATEGORIES

export function isLogCategory(category: string): category is LogCategory {
  return category in LOG_CATEGORIES
}

export const LOG_CATEGORY_LIST: LogCategory[] = [
  'ai',
  'combat',
  'missions',
  'agents',
  'purchasing',
  'lead-investigation',
  'turn-advancement',
  'persistence',
  'general',
]
