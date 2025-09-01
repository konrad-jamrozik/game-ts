import { agFix } from './agentFixture'

// Utility function to reset all ID counters for test isolation
export function resetAllFixtures(): void {
  agFix.resetIdCounter()
}
export { wpnFix as WeaponFixture } from './weaponFixture'
export { agFix as AgentFixture } from './agentFixture'
