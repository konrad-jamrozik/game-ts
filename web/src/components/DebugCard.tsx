import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch } from '../redux/hooks'
import { ExpandableCard } from './Common/ExpandableCard'
import {
  debugSpawnMissionSites,
  debugSetPanicToZero,
  debugSetAllFactionsSuppressionTo1000Percent,
  debugAddMoney,
  debugSpawn10Agents,
  debugAddCapabilities,
  debugAddEverything,
} from '../redux/slices/gameStateSlice'

export function DebugCard(): React.JSX.Element {
  const dispatch = useAppDispatch()

  function handleSpawnMissionSites(): void {
    dispatch(debugSpawnMissionSites())
  }

  function handleSetPanicToZero(): void {
    dispatch(debugSetPanicToZero())
  }

  function handleSetAllFactionsSuppressionTo1000Percent(): void {
    dispatch(debugSetAllFactionsSuppressionTo1000Percent())
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

  return (
    <ExpandableCard title="Debug" defaultExpanded={true}>
      <Stack spacing={1}>
        <Button variant="contained" onClick={handleSpawnMissionSites}>
          Spawn mission sites
        </Button>
        <Button variant="contained" onClick={handleSetPanicToZero}>
          Set panic to zero
        </Button>
        <Button variant="contained" onClick={handleSetAllFactionsSuppressionTo1000Percent}>
          Set all factions suppression to 1000%
        </Button>
        <Button variant="contained" onClick={handleAddMoney}>
          Add 10000 money
        </Button>
        <Button variant="contained" onClick={handleSpawn10Agents}>
          Spawn 10 agents
        </Button>
        <Button variant="contained" onClick={handleAddCapabilities}>
          Add capabilities
        </Button>
        <Button variant="contained" onClick={handleAddEverything}>
          Add everything
        </Button>
      </Stack>
    </ExpandableCard>
  )
}
