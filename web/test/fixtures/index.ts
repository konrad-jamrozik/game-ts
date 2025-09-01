import { agFix } from './agentFixture'
import { enFix } from './enemyFixture'
import { misStFix } from './missionSiteFixture'

// Utility function to reset all ID counters for test isolation
export function resetAllFixtures(): void {
  agFix.resetIdCounter()
  enFix.resetIdCounter()
  misStFix.resetIdCounter()
}
export { wpnFix as WeaponFixture } from './weaponFixture'
export { agFix as AgentFixture } from './agentFixture'
export { enFix as EnemyFixture } from './enemyFixture'
export { misStFix as MissionSiteFixture } from './missionSiteFixture'
