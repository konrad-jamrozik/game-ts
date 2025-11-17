import Button from '@mui/material/Button'
import * as React from 'react'
import { useAppDispatch } from '../app/hooks'
import { ExpandableCard } from './ExpandableCard'
import { debugSpawnMissionSites } from '../lib/slices/gameStateSlice'

export function DebugCard(): React.JSX.Element {
  const dispatch = useAppDispatch()

  function handleSpawnMissionSites(): void {
    dispatch(debugSpawnMissionSites())
  }

  return (
    <ExpandableCard title="Debug" defaultExpanded={true}>
      <Button variant="contained" onClick={handleSpawnMissionSites}>
        Spawn mission sites
      </Button>
    </ExpandableCard>
  )
}
