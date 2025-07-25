import type { LeadCardProps } from '../components/LeadCard'

// 🚧KJA leads shouldn't expire often, and be repeatable. But "Missions" should expire relatively quickly.
// 🚧KJA decouple "LeadCardProps" from "Lead" - a new model to be introduces.
export const leads: LeadCardProps[] = [
  {
    id: 'lead-criminal-orgs',
    title: 'Criminal organizations',
    intelCost: 20,
    description: 'Investigate notorious criminal organizations operating from the shadows.',
    expiresIn: 'never',
  },
  {
    id: 'lead-red-dawn-apprehend',
    title: 'Red Dawn member apprehension',
    intelCost: 20,
    description: 'Apprehend a member of the Red Dawn cult.',
    expiresIn: 'never',
  },
  {
    id: 'lead-red-dawn-interrogate',
    title: 'Red Dawn member interrogation',
    intelCost: 0,
    description: 'Interrogate a captured member of the Red Dawn cult.',
    expiresIn: 'never',
  },
  {
    id: 'lead-red-dawn-profile',
    title: 'Red Dawn cult profile',
    intelCost: 50,
    description: 'Establish a basic profile about the Red Dawn cult.',
    expiresIn: 'never',
  },
  {
    id: 'lead-red-dawn-safehouse',
    title: 'Red Dawn safe house location',
    intelCost: 30,
    description: 'Locate Red Dawn safe house.',
    expiresIn: 'never',
  },
]

// Helper function to get intel cost by lead ID
export function getLeadIntelCost(leadId: string): number {
  const lead = leads.find((card) => card.id === leadId)
  return lead?.intelCost ?? 0
}
