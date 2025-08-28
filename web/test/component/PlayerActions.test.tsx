import { describe, expect, test } from 'vitest'
import { PlayerActions } from '../../src/components/PlayerActions'
import { fix } from './componentFixture'

describe(PlayerActions, () => {
  test("click 'hire agent' button -> happy path", async () => {
    fix.renderPlayerActions()
    expect(fix.agentsView).toHaveLength(0)

    await fix.hireAgent() // Act

    expect(fix.agentsView).toHaveLength(1)
  })

  // Additional hireAgent tests
  test("click 'hire agent' button -> alert: insufficient funds", async () => {
    fix.setMoney(0)
    fix.renderPlayerActions()

    expect(fix.agentsView).toHaveLength(0)
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.hireAgent() // Act

    expect(fix.agentsView).toHaveLength(0)
    fix.expectPlayerActionsAlert('Insufficient funds')
  })

  // sackAgents tests
  test.todo("click 'sack agents' button -> happy path")

  test.todo("click 'sack agents' button -> alert: agents in invalid states")

  // assignAgentsToContracting tests
  test.todo("click 'assign agents to contracting' button -> happy path")

  test.todo("click 'assign agents to contracting' button -> alert: agents in invalid states")

  // assignAgentsToEspionage tests
  test.todo("click 'assign agents to espionage' button -> happy path")

  test.todo("click 'assign agents to espionage' button -> alert: agents in invalid states")

  // recallAgents tests
  test.todo("click 'recall agents' button -> happy path")

  test.todo("click 'recall agents' button -> alert: agents in invalid states")

  // investigateLead tests
  test.todo("click 'investigate lead' button -> happy path")

  test.todo("click 'investigate lead' button -> alert: insufficient intel")

  // deployAgentsToMission tests
  test.todo("click 'deploy agents to active mission site' button -> happy path")

  test.todo("click 'deploy agents to active mission site' button -> alert: agents in invalid states")
})
