
import { AgentFixture } from './agentFixtures'
import { LeadFixture } from './leadFixtures'
import { EnemyFixture } from './enemyFixtures'
import { MissionFixture, MissionSiteFixture } from './missionFixtures'





// Utility function to reset all ID counters for test isolation
export function resetAllFixtures(): void {
  AgentFixture.resetIdCounter()
  LeadFixture.resetIdCounter()
  EnemyFixture.resetIdCounter()
  MissionFixture.resetIdCounter()
  MissionSiteFixture.resetIdCounter()
}
export {WeaponFixture} from './weaponFixtures'
export {FactionFixture} from './factionFixtures'
export {GameStateFixture} from './gameStateFixtures'
export {AgentFixture} from './agentFixtures'
export {LeadFixture} from './leadFixtures'
export {EnemyFixture} from './enemyFixtures'
export {MissionFixture, MissionSiteFixture} from './missionFixtures'