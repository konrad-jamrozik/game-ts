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
import { isGameLost, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { delegateTurnToAIPlayer, delegateTurnsToAIPlayer } from '../../ai/delegateTurnsToAIPlayer'
import { getAllIntellectNames, getIntellect } from '../../ai/intellectRegistry'
import { setAIIntellectSelection, setAutoAdvanceTurn, setAITurnCount } from '../../redux/slices/selectionSlice'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { NumberField } from './NumberField'
import { getCurrentTurnState } from '../../redux/storeUtils'

const DEFAULT_AI_INTELLECT = 'basic'
const DEFAULT_AI_TURN_COUNT = 50
const DEFAULT_AUTO_ADVANCE_TURN = true

export function AIPlayerCard(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const selectedAIIntellect = useAppSelector((state) => state.selection.selectedAIIntellect)
  const autoAdvanceTurn = useAppSelector((state) => state.selection.autoAdvanceTurn ?? DEFAULT_AUTO_ADVANCE_TURN)
  const aiTurnCount = useAppSelector((state) => state.selection.aiTurnCount ?? DEFAULT_AI_TURN_COUNT)
  const intellectNames = getAllIntellectNames()
  const selectedIntellect = selectedAIIntellect ?? DEFAULT_AI_INTELLECT

  const gameLost = isGameLost(gameState)
  const gameWon = isGameWon(gameState)
  const isGameEnded = gameLost || gameWon
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

  function handleDelegateTurnsToAI(): void {
    if (!hasValidIntellect) {
      return
    }
    delegateTurnsToAIPlayer(selectedIntellect, aiTurnCount)
  }

  function handleTurnCountChange(value: number | null): void {
    if (typeof value === 'number' && value >= 1) {
      dispatch(setAITurnCount(value))
    }
  }

  function handleNextTurn(): void {
    dispatch(advanceTurn())
  }

  return (
    <ExpandableCard id="ai-player-card" title="AI Player" defaultExpanded={true} sx={{ width: LEFT_COLUMN_CARD_WIDTH }}>
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
        <NumberField
          value={aiTurnCount}
          onValueChange={handleTurnCountChange}
          min={1}
          disabled={isButtonDisabled}
          label="Turns to delegate"
          style={{
            width: '100%',
          }}
        />
        <Button variant="contained" onClick={handleDelegateTurnsToAI} disabled={isButtonDisabled} fullWidth>
          Delegate {aiTurnCount} turn{aiTurnCount !== 1 ? 's' : ''} to AI
        </Button>
      </Stack>
    </ExpandableCard>
  )
}
