import { toF6 } from '../primitives/fixed6'
import type { Faction } from '../model/model'

export const factions: Faction[] = [
  {
    id: 'faction-red-dawn',
    name: 'Red Dawn',
    threatLevel: toF6(0.01), // 100 basis points = 1% = 0.01
    threatIncrease: toF6(0.0005), // 5 basis points = 0.05% = 0.0005
    suppression: toF6(0),
    discoveryPrerequisite: ['lead-red-dawn-profile'],
  },
]
