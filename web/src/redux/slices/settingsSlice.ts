import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SettingsState = {
  areResetControlsExpanded: boolean
  revealAllFactionProfiles: boolean
  // Optional because persisted state saved before this field existed won't have it
  rollSuccessfulLeadInvestigations?: boolean
}

const initialState: SettingsState = {
  areResetControlsExpanded: true,
  revealAllFactionProfiles: false,
  rollSuccessfulLeadInvestigations: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setResetControlsExpanded(state, action: PayloadAction<boolean>) {
      state.areResetControlsExpanded = action.payload
    },
    toggleResetControlsExpanded(state) {
      state.areResetControlsExpanded = !state.areResetControlsExpanded
    },
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
  },
})

export const {
  setResetControlsExpanded,
  toggleResetControlsExpanded,
  toggleRevealAllFactionProfiles,
  setRevealAllFactionProfiles,
  toggleRollSuccessfulLeadInvestigations,
  setRollSuccessfulLeadInvestigations,
} = settingsSlice.actions
export default settingsSlice.reducer
