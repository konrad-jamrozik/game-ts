import type { GameEvent } from './eventsSlice'

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
export function createGameEvent(message: string, context: GameContext): Omit<GameEvent, 'id' | 'timestamp'> {
  return {
    message,
    turn: context.turn,
    actionsCount: context.actionsCount,
  }
}

/**
 * Creates a mission completion event
 */
export function createMissionCompletionEvent(
  missionTitle: string,
  context: GameContext,
): Omit<GameEvent, 'id' | 'timestamp'> {
  return createGameEvent(`Mission "${missionTitle}" completed successfully!`, context)
}

/**
 * Creates a reward event
 */
export function createRewardEvent(
  rewardType: 'Money' | 'Intel' | 'Funding' | 'Panic Reduction',
  amount: number,
  context: GameContext,
): Omit<GameEvent, 'id' | 'timestamp'> {
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
export function createAgentActionEvent(
  config: AgentActionConfig,
  context: GameContext,
): Omit<GameEvent, 'id' | 'timestamp'> {
  const { action, agentCount, target } = config

  switch (action) {
    case 'hired': {
      return createGameEvent('Agent hired', context)
    }
    case 'sacked': {
      const count = agentCount ?? 1
      const plural = count === 1 ? '' : 's'
      return createGameEvent(`${count} agent${plural} sacked`, context)
    }
    case 'assigned': {
      const count = agentCount ?? 1
      const plural = count === 1 ? '' : 's'
      return createGameEvent(`${count} agent${plural} assigned to ${target ?? 'assignment'}`, context)
    }
    case 'recalled': {
      const count = agentCount ?? 1
      const plural = count === 1 ? '' : 's'
      return createGameEvent(`${count} agent${plural} recalled from assignment`, context)
    }
    case 'deployed': {
      const count = agentCount ?? 1
      const plural = count === 1 ? '' : 's'
      return createGameEvent(`${count} agent${plural} deployed to ${target ?? 'mission'}`, context)
    }
    default: {
      // This should never happen with proper TypeScript usage, but satisfies exhaustiveness
      return createGameEvent(`Agent action: ${String(action)}`, context)
    }
  }
}
