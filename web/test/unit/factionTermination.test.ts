import { describe, expect, test } from 'vitest'
import { isFactionTerminated } from '../../src/lib/model_utils/factionUtils'
import { isFactionForLeadTerminated } from '../../src/lib/model_utils/leadUtils'
import { dataTables } from '../../src/lib/data_tables/dataTables'
import type { Faction } from '../../src/lib/model/factionModel'

describe('factionTermination', () => {
  describe(isFactionTerminated, () => {
    test('returns false when terminate-cult lead has not been completed', () => {
      const faction: Faction = {
        id: 'faction-red-dawn',
        factionDataId: 'factiondata-red-dawn',
        activityLevel: 1,
        turnsAtCurrentLevel: 0,
        targetTurnsForProgression: 5,
        turnsUntilNextOperation: 10,
        suppressionTurns: 0,
      }
      const leadInvestigationCounts: Record<string, number> = {}
      expect(isFactionTerminated(faction, leadInvestigationCounts)).toBe(false)
    })

    test('returns true when terminate-cult lead has been completed once', () => {
      const faction: Faction = {
        id: 'faction-red-dawn',
        factionDataId: 'factiondata-red-dawn',
        activityLevel: 1,
        turnsAtCurrentLevel: 0,
        targetTurnsForProgression: 5,
        turnsUntilNextOperation: 10,
        suppressionTurns: 0,
      }
      const leadInvestigationCounts: Record<string, number> = {
        'lead-red-dawn-terminate-cult': 1,
      }
      expect(isFactionTerminated(faction, leadInvestigationCounts)).toBe(true)
    })

    test('returns true when terminate-cult lead has been completed multiple times', () => {
      const faction: Faction = {
        id: 'faction-red-dawn',
        factionDataId: 'factiondata-red-dawn',
        activityLevel: 1,
        turnsAtCurrentLevel: 0,
        targetTurnsForProgression: 5,
        turnsUntilNextOperation: 10,
        suppressionTurns: 0,
      }
      const leadInvestigationCounts: Record<string, number> = {
        'lead-red-dawn-terminate-cult': 3,
      }
      expect(isFactionTerminated(faction, leadInvestigationCounts)).toBe(true)
    })

    test('works for different factions', () => {
      const redDawn: Faction = {
        id: 'faction-red-dawn',
        factionDataId: 'factiondata-red-dawn',
        activityLevel: 1,
        turnsAtCurrentLevel: 0,
        targetTurnsForProgression: 5,
        turnsUntilNextOperation: 10,
        suppressionTurns: 0,
      }
      const exalt: Faction = {
        id: 'faction-exalt',
        factionDataId: 'factiondata-exalt',
        activityLevel: 0,
        turnsAtCurrentLevel: 0,
        targetTurnsForProgression: 5,
        turnsUntilNextOperation: Infinity,
        suppressionTurns: 0,
      }
      const leadInvestigationCounts: Record<string, number> = {
        'lead-red-dawn-terminate-cult': 1,
      }
      expect(isFactionTerminated(redDawn, leadInvestigationCounts)).toBe(true)
      expect(isFactionTerminated(exalt, leadInvestigationCounts)).toBe(false)
    })
  })

  describe(isFactionForLeadTerminated, () => {
    test('returns false when lead faction has not been terminated', () => {
      const lead = dataTables.leads.find((l) => l.id === 'lead-red-dawn-profile')
      expect(lead).toBeDefined()
      if (!lead) return

      const factions: Faction[] = [
        {
          id: 'faction-red-dawn',
          factionDataId: 'factiondata-red-dawn',
          activityLevel: 1,
          turnsAtCurrentLevel: 0,
          targetTurnsForProgression: 5,
          turnsUntilNextOperation: 10,
          suppressionTurns: 0,
        },
      ]
      const leadInvestigationCounts: Record<string, number> = {}
      expect(isFactionForLeadTerminated(lead, factions, leadInvestigationCounts)).toBe(false)
    })

    test('returns true when lead faction has been terminated', () => {
      const lead = dataTables.leads.find((l) => l.id === 'lead-red-dawn-profile')
      expect(lead).toBeDefined()
      if (!lead) return

      const factions: Faction[] = [
        {
          id: 'faction-red-dawn',
          factionDataId: 'factiondata-red-dawn',
          activityLevel: 1,
          turnsAtCurrentLevel: 0,
          targetTurnsForProgression: 5,
          turnsUntilNextOperation: Infinity,
          suppressionTurns: 0,
        },
      ]
      const leadInvestigationCounts: Record<string, number> = {
        'lead-red-dawn-terminate-cult': 1,
      }
      expect(isFactionForLeadTerminated(lead, factions, leadInvestigationCounts)).toBe(true)
    })

    test('returns false when lead does not match faction pattern', () => {
      const lead = dataTables.leads.find((l) => l.id === 'lead-deep-state')
      expect(lead).toBeDefined()
      if (!lead) return

      const factions: Faction[] = [
        {
          id: 'faction-red-dawn',
          factionDataId: 'factiondata-red-dawn',
          activityLevel: 1,
          turnsAtCurrentLevel: 0,
          targetTurnsForProgression: 5,
          turnsUntilNextOperation: 10,
          suppressionTurns: 0,
        },
      ]
      const leadInvestigationCounts: Record<string, number> = {
        'lead-red-dawn-terminate-cult': 1,
      }
      expect(isFactionForLeadTerminated(lead, factions, leadInvestigationCounts)).toBe(false)
    })
  })
})
