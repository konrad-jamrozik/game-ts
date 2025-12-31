import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch } from '../redux/hooks'
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

export function DebugActionsCard(): React.JSX.Element {
  const dispatch = useAppDispatch()

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

  function handleTerminateRedDawn(): void {
    dispatch(debugTerminateRedDawn())
  }

  return (
    <ExpandableCard
      id="debug-actions"
      title="Debug actions"
      defaultExpanded={true}
      sx={{ width: LEFT_COLUMN_CARD_WIDTH }}
    >
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
        <Button variant="contained" onClick={handleTerminateRedDawn}>
          Terminate Red Dawn
        </Button>
      </Stack>
    </ExpandableCard>
  )
}
