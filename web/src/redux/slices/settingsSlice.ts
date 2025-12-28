import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SettingsState = {
  areResetControlsExpanded: boolean
  revealAllFactionProfiles: boolean
}

const initialState: SettingsState = {
  areResetControlsExpanded: true,
  revealAllFactionProfiles: false,
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
  },
})

export const {
  setResetControlsExpanded,
  toggleResetControlsExpanded,
  toggleRevealAllFactionProfiles,
  setRevealAllFactionProfiles,
} = settingsSlice.actions
export default settingsSlice.reducer
