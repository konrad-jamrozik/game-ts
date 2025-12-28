import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { ExpandableCard } from '../Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { isGameOver, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { delegateTurnToAIPlayer } from '../../ai/delegateTurnToAIPlayer'
import { getAllIntellectNames, getIntellect } from '../../ai/intellectRegistry'
import { setAIIntellectSelection, setAutoAdvanceTurn } from '../../redux/slices/selectionSlice'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { assertDefined } from '../../lib/primitives/assertPrimitives'

export function AIPlayerSection(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const selectedAIIntellect = useAppSelector((state) => state.selection.selectedAIIntellect)
  const autoAdvanceTurn = useAppSelector((state) => state.selection.autoAdvanceTurn ?? false)
  const intellectNames = getAllIntellectNames()
  assertDefined(intellectNames[0], 'No intellect names found')
  const initialIntellect = intellectNames[0]
  const selectedIntellect = selectedAIIntellect ?? initialIntellect

  const gameOver = isGameOver(gameState)
  const gameWon = isGameWon(gameState)
  const isGameEnded = gameOver || gameWon
  const hasValidIntellect = selectedIntellect !== '' && intellectNames.includes(selectedIntellect)
  const isButtonDisabled = isGameEnded || !hasValidIntellect

  function handleIntellectChange(event: SelectChangeEvent): void {
    dispatch(setAIIntellectSelection(event.target.value))
  }

  function handleAutoAdvanceTurnChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setAutoAdvanceTurn(event.target.checked))
  }

  function handleDelegateToAI(): void {
    if (!hasValidIntellect) {
      return
    }
    delegateTurnToAIPlayer(selectedIntellect)
  }

  function handleNextTurn(): void {
    dispatch(advanceTurn())
  }

  return (
    <ExpandableCard
      id="ai-player-section"
      title="AI Player"
      defaultExpanded={false}
      sx={{ width: LEFT_COLUMN_CARD_WIDTH }}
    >
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="ai-intellect-select-label">AI Player Intellect</InputLabel>
          <Select
            labelId="ai-intellect-select-label"
            id="ai-intellect-select"
            value={selectedIntellect}
            label="AI Player Intellect"
            onChange={handleIntellectChange}
          >
            {intellectNames.map((name) => {
              const intellect = getIntellect(name)
              return (
                <MenuItem key={name} value={name}>
                  {intellect.name}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleDelegateToAI} disabled={isButtonDisabled} fullWidth>
          Delegate to AI
        </Button>
        <FormControlLabel
          control={<Checkbox checked={autoAdvanceTurn} onChange={handleAutoAdvanceTurnChange} />}
          label="Auto-advance turn"
        />
        <Button variant="contained" onClick={handleNextTurn} disabled={isGameEnded} fullWidth>
          Next turn
        </Button>
      </Stack>
    </ExpandableCard>
  )
}
