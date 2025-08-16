import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SettingsState = {
  areResetControlsExpanded: boolean
}

const initialState: SettingsState = {
  areResetControlsExpanded: false,
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
  },
})

export const { setResetControlsExpanded, toggleResetControlsExpanded } = settingsSlice.actions
export default settingsSlice.reducer
