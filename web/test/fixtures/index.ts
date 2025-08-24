import { AgentFixture } from './AgentFixture'
import { LeadFixture } from './LeadFixture'
import { EnemyFixture } from './EnemyFixture'
import { MissionFixture } from './MissionFixture'
import { MissionSiteFixture } from './MissionSiteFixture'

// Utility function to reset all ID counters for test isolation
export function resetAllFixtures(): void {
  AgentFixture.resetIdCounter()
  LeadFixture.resetIdCounter()
  EnemyFixture.resetIdCounter()
  MissionFixture.resetIdCounter()
  MissionSiteFixture.resetIdCounter()
}
export { WeaponFixture } from './WeaponFixture'
export { FactionFixture } from './FactionFixture'
export { GameStateFixture } from './GameStateFixture'
export { AgentFixture } from './AgentFixture'
export { LeadFixture } from './LeadFixture'
export { EnemyFixture } from './EnemyFixture'
export { MissionFixture } from './MissionFixture'
export { MissionSiteFixture } from './MissionSiteFixture'
