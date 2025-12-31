import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { ExpandableCard } from './Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from './Common/widthConstants'
import {
  debugSpawnMissions,
  debugSetPanicToZero,
  debugSetAllFactionsSuppression,
  debugAddMoney,
  debugSpawn10Agents,
  debugAddCapabilities,
  debugAddEverything,
  debugTerminateRedDawn,
} from '../redux/slices/gameStateSlice'
import { setRollSuccessfulLeadInvestigations, toggleRevealAllFactionProfiles } from '../redux/slices/settingsSlice'
import { rand } from '../lib/primitives/rand'

export function DebugCard(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const rollSuccessfulLeadInvestigations =
    useAppSelector((state) => state.settings.rollSuccessfulLeadInvestigations) ?? false

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

  function handleSpawnMissions(): void {
    dispatch(debugSpawnMissions())
  }

  function handleSetPanicToZero(): void {
    dispatch(debugSetPanicToZero())
  }

  function handleSetAllFactionsSuppression(): void {
    dispatch(debugSetAllFactionsSuppression())
  }

  function handleAddMoney(): void {
    dispatch(debugAddMoney())
  }

  function handleSpawn10Agents(): void {
    dispatch(debugSpawn10Agents())
  }

  function handleAddCapabilities(): void {
    dispatch(debugAddCapabilities())
  }

  function handleAddEverything(): void {
    dispatch(debugAddEverything())
  }

  function handleRevealAllFactionProfiles(): void {
    dispatch(toggleRevealAllFactionProfiles())
  }

  function handleTerminateRedDawn(): void {
    dispatch(debugTerminateRedDawn())
  }

  function handleRollSuccessfulLeadInvestigationsChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setRollSuccessfulLeadInvestigations(event.target.checked))
  }

  return (
    <ExpandableCard id="debug" title="Debug" defaultExpanded={true} sx={{ width: LEFT_COLUMN_CARD_WIDTH }}>
      <Stack spacing={1}>
        <Button variant="contained" onClick={handleAddEverything}>
          Add everything
        </Button>
        <Button variant="contained" onClick={handleSetPanicToZero}>
          Set panic to zero
        </Button>
        <Button variant="contained" onClick={handleSetAllFactionsSuppression}>
          Set all factions suppression to 100
        </Button>
        <Button variant="contained" onClick={handleAddMoney}>
          Add 10000 money
        </Button>
        <Button variant="contained" onClick={handleAddCapabilities}>
          Add 100 to cap capabilities
        </Button>
        <Button variant="contained" onClick={handleSpawn10Agents}>
          Spawn 10 agents
        </Button>
        <Button variant="contained" onClick={handleSpawnMissions}>
          Spawn missions
        </Button>
        <Button variant="contained" onClick={handleRevealAllFactionProfiles}>
          Reveal all faction profiles
        </Button>
        <FormControlLabel
          control={
            <Checkbox
              checked={rollSuccessfulLeadInvestigations}
              onChange={handleRollSuccessfulLeadInvestigationsChange}
            />
          }
          label="Roll successful lead investigations"
        />
        <Button variant="contained" onClick={handleTerminateRedDawn}>
          Terminate Red Dawn
        </Button>
      </Stack>
    </ExpandableCard>
  )
}
