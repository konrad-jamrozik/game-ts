import { formatAgentCount } from './AgentService'
import type { TextEvent } from './eventsSlice'

/**
 * Service for creating game events with consistent patterns
 */

type GameContext = {
  turn: number
  actionsCount: number
}

/**
 * Creates a game event with the current game state context
 */
export function createGameEvent(message: string, context: GameContext): Omit<TextEvent, 'id' | 'timestamp'> {
  return {
    type: 'Text',
    message,
    turn: context.turn,
    actionsCount: context.actionsCount,
  }
}

/**
 * Creates a mission completion event
 */
// KJA actually use this function
export function createMissionCompletionEvent(
  missionTitle: string,
  context: GameContext,
): Omit<TextEvent, 'id' | 'timestamp'> {
  return createGameEvent(`Mission "${missionTitle}" completed successfully!`, context)
}

/**
 * Creates a reward event
 */
// KJA actually use this function
export function createRewardEvent(
  rewardType: 'Money' | 'Intel' | 'Funding' | 'Panic Reduction',
  amount: number,
  context: GameContext,
): Omit<TextEvent, 'id' | 'timestamp'> {
  const messages = {
    Money: `Received $${amount} from mission completion`,
    Intel: `Gained ${amount} intel from mission completion`,
    Funding: `Received ${amount} funding from mission completion`,
    'Panic Reduction': `Panic reduced by ${amount} from mission completion`,
  }

  return createGameEvent(messages[rewardType], context)
}

type AgentActionType = 'hired' | 'sacked' | 'assigned' | 'recalled' | 'deployed'

type AgentActionConfig = {
  action: AgentActionType
  agentCount?: number
  target?: string
}

/**
 * Creates an agent action event
 */
// KJA actually use this function
export function createAgentActionEvent(
  config: AgentActionConfig,
  context: GameContext,
): Omit<TextEvent, 'id' | 'timestamp'> {
  const { action, agentCount, target } = config

  switch (action) {
    case 'hired': {
      return createGameEvent('Agent hired', context)
    }
    case 'sacked': {
      const count = agentCount ?? 1
      return createGameEvent(`${formatAgentCount(count)} sacked`, context)
    }
    case 'assigned': {
      const count = agentCount ?? 1
      return createGameEvent(`${formatAgentCount(count)} assigned to ${target ?? 'assignment'}`, context)
    }
    case 'recalled': {
      const count = agentCount ?? 1
      return createGameEvent(`${formatAgentCount(count)} recalled from assignment`, context)
    }
    case 'deployed': {
      const count = agentCount ?? 1
      return createGameEvent(`${formatAgentCount(count)} deployed to ${target ?? 'mission'}`, context)
    }
    default: {
      // This should never happen with proper TypeScript usage, but satisfies exhaustiveness
      return createGameEvent(`Agent action: ${String(action)}`, context)
    }
  }
}
