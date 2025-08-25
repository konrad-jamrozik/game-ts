import { describe, expect, test } from 'vitest'
import settingsReducer, {
  setResetControlsExpanded,
  toggleResetControlsExpanded,
  type SettingsState,
} from '../../src/lib/slices/settingsSlice'

describe('settingsSlice', () => {
  const initialState: SettingsState = {
    areResetControlsExpanded: false,
  }

  test('return the initial state', () => {
    expect.hasAssertions()

    const result = settingsReducer(undefined, { type: '' })

    expect(result).toStrictEqual(initialState)
  })

  test('setResetControlsExpanded should set the expanded state', () => {
    expect.hasAssertions()

    const result = settingsReducer(initialState, setResetControlsExpanded(true))

    expect(result.areResetControlsExpanded).toBe(true)
  })

  test('toggleResetControlsExpanded should toggle the expanded state', () => {
    expect.hasAssertions()

    // Toggle from false to true
    let result = settingsReducer(initialState, toggleResetControlsExpanded())

    expect(result.areResetControlsExpanded).toBe(true)

    // Toggle from true to false
    result = settingsReducer(result, toggleResetControlsExpanded())

    expect(result.areResetControlsExpanded).toBe(false)
  })
})
