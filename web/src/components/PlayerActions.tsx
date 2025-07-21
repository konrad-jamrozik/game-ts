import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { createRowSelectionManager, type GridRowId, type GridRowSelectionModel } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { hireAgent, sackAgents } from '../model/gameStateSlice'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentsRowSelectionModel = useAppSelector((state) => state.selection.agents)
  const agents = useAppSelector((state) => state.undoable.present.gameState.agents)
  console.log('rendering PlayerActions')

  // 🚧KJA this is converting SerializableGridSelectionModel to GridRowSelectionModel. Encapsulate.
  // Also document https://chatgpt.com/c/687e00be-c7f0-8011-8484-75a11e10c298
  const idsSet = new Set<GridRowId>(agentsRowSelectionModel.ids)
  const model: GridRowSelectionModel = { type: agentsRowSelectionModel.type, ids: idsSet }
  // https://github.com/mui/mui-x/blob/de2de2e133267e61a030b9b4c53a4fe3c4af7a40/packages/x-data-grid/src/models/gridRowSelectionManager.ts#L51
  const selectionMgr = createRowSelectionManager(model)
  const selectedAgentIds = agents.map((agent) => agent.id).filter((id) => selectionMgr.has(id))

  function handleSackAgents(): void {
    dispatch(sackAgents(selectedAgentIds))
  }

  console.log('agents:', agents)
  console.log('selectedAgentIds:', selectedAgentIds)

  return (
    <Card>
      <CardHeader title="Player Actions" />
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => dispatch(hireAgent())}>
            Hire Agent
          </Button>
          <Button variant="contained" onClick={handleSackAgents} disabled={selectedAgentIds.length === 0}>
            Sack {selectedAgentIds.length} Agent{selectedAgentIds.length > 1 ? 's' : ''}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
