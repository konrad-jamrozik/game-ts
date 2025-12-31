export const LOG_CATEGORIES = {
  ai: { badge: '🤖 AI', color: 'hsl(291, 64%, 42%)' },
  combat: { badge: '⚔️ Combat', color: 'hsl(4, 90%, 58%)' },
  missions: { badge: '🎯 Missions', color: 'hsl(207, 90%, 54%)' },
  agents: { badge: '👤 Agents', color: 'hsl(122, 39%, 49%)' },
  purchasing: { badge: '💰 Purchasing', color: 'hsl(36, 100%, 50%)' },
  'lead-investigation': { badge: '🔍 Leads', color: 'hsl(187, 100%, 42%)' },
  'turn-advancement': { badge: '⏭️ Turn', color: 'hsl(262, 47%, 42%)' },
  persistence: { badge: '💾 Persist', color: 'hsl(199, 18%, 46%)' },
  player: { badge: '⚡ Player', color: 'hsl(14, 73.40%, 31.00%)' },
  general: { badge: '📝 Log', color: '#hsl(0, 0%, 62%)' },
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
  'player',
  'general',
]
