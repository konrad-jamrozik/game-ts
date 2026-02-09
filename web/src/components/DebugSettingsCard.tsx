import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { ExpandableCard } from './Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from './Common/widthConstants'
import {
  setRollSuccessfulLeadInvestigations,
  setRollSuccessfulCombat,
  setRevealAllFactionProfiles,
  toggleLogCategory,
  setAllLogCategories,
} from '../redux/slices/settingsSlice'
import { rand } from '../lib/primitives/rand'
import { log } from '../lib/primitives/logger'
import { LOG_CATEGORIES, type LogCategory, LOG_CATEGORY_LIST } from '../lib/primitives/logCategories'
import { Typography } from '@mui/material'

export function DebugSettingsCard(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const rollSuccessfulLeadInvestigations =
    useAppSelector((state) => state.settings.rollSuccessfulLeadInvestigations) ?? false
  const rollSuccessfulCombat = useAppSelector((state) => state.settings.rollSuccessfulCombat) ?? false
  const revealAllFactionProfiles = useAppSelector((state) => state.settings.revealAllFactionProfiles)
  const enabledLogCategories = useAppSelector((state) => state.settings.enabledLogCategories)

  // Sync rand override with persisted Redux state. The Redux state persists across page refreshes
  // (via IndexedDB), but rand overrides are in-memory only. This ensures that when the app loads
  // and the checkbox was previously checked, the rand override is restored so lead investigations
  // continue to succeed.
  React.useEffect(() => {
    if (rollSuccessfulLeadInvestigations) {
      rand.set('lead-investigation', 1)
    } else {
      rand.reset('lead-investigation')
    }
  }, [rollSuccessfulLeadInvestigations])

  // Sync rand overrides for combat rolls with persisted Redux state. When checked, agent attacks
  // always succeed (agent_attack_roll = 1) and enemy attacks always fail (enemy_attack_roll = 0).
  React.useEffect(() => {
    if (rollSuccessfulCombat) {
      rand.set('agent_attack_roll', 1)
      rand.set('enemy_attack_roll', 0)
    } else {
      rand.reset('agent_attack_roll')
      rand.reset('enemy_attack_roll')
    }
  }, [rollSuccessfulCombat])

  // Sync log category settings from Redux state to logger's internal state.
  // This ensures that when the app loads and checkboxes were previously checked,
  // the logger's internal state is restored.
  React.useEffect(() => {
    log.setAll(enabledLogCategories ?? {})
  }, [enabledLogCategories])

  function handleRevealAllFactionProfilesChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setRevealAllFactionProfiles(event.target.checked))
  }

  function handleRollSuccessfulLeadInvestigationsChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setRollSuccessfulLeadInvestigations(event.target.checked))
  }

  function handleRollSuccessfulCombatChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setRollSuccessfulCombat(event.target.checked))
  }

  function handleLogCategoryChange(category: LogCategory): void {
    dispatch(toggleLogCategory(category))
  }

  const allCategoriesEnabled = LOG_CATEGORY_LIST.every((category) => enabledLogCategories?.[category] === true)

  function handleAllLogCategoriesChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setAllLogCategories(event.target.checked))
  }

  return (
    <ExpandableCard
      id="debug-settings"
      title="Debug settings"
      defaultExpanded={true}
      sx={{ width: LEFT_COLUMN_CARD_WIDTH }}
    >
      <Stack spacing={1}>
        <FormControlLabel
          control={<Checkbox checked={revealAllFactionProfiles} onChange={handleRevealAllFactionProfilesChange} />}
          label="Reveal all faction profiles"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={rollSuccessfulLeadInvestigations}
              onChange={handleRollSuccessfulLeadInvestigationsChange}
            />
          }
          label="Roll successful lead investigations"
        />
        <FormControlLabel
          control={<Checkbox checked={rollSuccessfulCombat} onChange={handleRollSuccessfulCombatChange} />}
          label="Roll successful combat"
        />

        <Stack spacing={0.5} sx={{ marginTop: 2 }}>
          <Typography variant="h6" sx={{ paddingLeft: 1 }}>
            Console Logging
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={allCategoriesEnabled} onChange={handleAllLogCategoriesChange} />}
            label="Everything"
          />
          {LOG_CATEGORY_LIST.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={enabledLogCategories?.[category] ?? false}
                  onChange={() => handleLogCategoryChange(category)}
                />
              }
              label={LOG_CATEGORIES[category].badge}
            />
          ))}
        </Stack>
      </Stack>
    </ExpandableCard>
  )
}
