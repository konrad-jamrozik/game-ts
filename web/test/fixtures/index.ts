import { agFix } from './agFix'
import { leadFix } from './leadFix'
import { enFix } from './enFix'
import { misFix } from './misFix'
import { misStFix } from './misStFix'

// Utility function to reset all ID counters for test isolation
export function resetAllFixtures(): void {
  agFix.resetIdCounter()
  leadFix.resetIdCounter()
  enFix.resetIdCounter()
  misFix.resetIdCounter()
  misStFix.resetIdCounter()
}
export { wpnFix as WeaponFixture } from './wpnFix'
export { facFix as FactionFixture } from './facFix'
export { GameStateFixture } from './GameStateFixture'
export { agFix as AgentFixture } from './agFix'
export { leadFix as LeadFixture } from './leadFix'
export { enFix as EnemyFixture } from './enFix'
export { misFix as MissionFixture } from './misFix'
export { misStFix as MissionSiteFixture } from './misStFix'
