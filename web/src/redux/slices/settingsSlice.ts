import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { LOG_CATEGORY_LIST, type LogCategory } from '../../lib/primitives/logCategories'

export type SettingsState = {
  revealAllFactionProfiles: boolean
  // Optional because persisted state saved before this field existed won't have it
  rollSuccessfulLeadInvestigations?: boolean
  rollSuccessfulCombat?: boolean
  enabledLogCategories?: Partial<Record<LogCategory, boolean>>
}

const initialState: SettingsState = {
  revealAllFactionProfiles: false,
  rollSuccessfulLeadInvestigations: false,
  rollSuccessfulCombat: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleRevealAllFactionProfiles(state) {
      state.revealAllFactionProfiles = !state.revealAllFactionProfiles
    },
    setRevealAllFactionProfiles(state, action: PayloadAction<boolean>) {
      state.revealAllFactionProfiles = action.payload
    },
    toggleRollSuccessfulLeadInvestigations(state) {
      state.rollSuccessfulLeadInvestigations = !(state.rollSuccessfulLeadInvestigations ?? false)
    },
    setRollSuccessfulLeadInvestigations(state, action: PayloadAction<boolean>) {
      state.rollSuccessfulLeadInvestigations = action.payload
    },
    toggleRollSuccessfulCombat(state) {
      state.rollSuccessfulCombat = !(state.rollSuccessfulCombat ?? false)
    },
    setRollSuccessfulCombat(state, action: PayloadAction<boolean>) {
      state.rollSuccessfulCombat = action.payload
    },
    toggleLogCategory(state, action: PayloadAction<LogCategory>) {
      state.enabledLogCategories ??= {}
      const current = state.enabledLogCategories[action.payload] ?? false
      state.enabledLogCategories[action.payload] = !current
    },
    setLogCategory(state, action: PayloadAction<{ category: LogCategory; enabled: boolean }>) {
      state.enabledLogCategories ??= {}
      state.enabledLogCategories[action.payload.category] = action.payload.enabled
    },
    setAllLogCategories(state, action: PayloadAction<boolean>) {
      state.enabledLogCategories ??= {}
      for (const category of LOG_CATEGORY_LIST) {
        state.enabledLogCategories[category] = action.payload
      }
    },
  },
})

export const {
  setRevealAllFactionProfiles,
  toggleRollSuccessfulLeadInvestigations,
  setRollSuccessfulLeadInvestigations,
  toggleRollSuccessfulCombat,
  setRollSuccessfulCombat,
  toggleLogCategory,
  setLogCategory,
  setAllLogCategories,
} = settingsSlice.actions
export default settingsSlice.reducer
