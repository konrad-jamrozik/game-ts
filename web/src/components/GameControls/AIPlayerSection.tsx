import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { NumberField } from '@base-ui/react/number-field'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { ExpandableCard } from '../Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { isGameOver, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { delegateTurnToAIPlayer, delegateTurnsToAIPlayer } from '../../ai/delegateTurnToAIPlayer'
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

  const [turnCount, setTurnCount] = React.useState<number>(1)

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

  function handleDelegateTurnsToAI(): void {
    if (!hasValidIntellect) {
      return
    }
    delegateTurnsToAIPlayer(selectedIntellect, turnCount)
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
        <NumberField.Root
          value={turnCount}
          onValueChange={(value) => {
            if (typeof value === 'number' && value >= 1) {
              setTurnCount(value)
            }
          }}
          min={1}
          disabled={isButtonDisabled}
          style={{
            width: '100%',
          }}
        >
          <NumberField.Group
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <NumberField.Decrement
              style={{
                border: 'none',
                background: 'transparent',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '1.25rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
              }}
            >
              −
            </NumberField.Decrement>
            <NumberField.Input
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px 8px',
                fontSize: '1rem',
                textAlign: 'center',
                minWidth: 0,
              }}
            />
            <NumberField.Increment
              style={{
                border: 'none',
                background: 'transparent',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '1.25rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
              }}
            >
              +
            </NumberField.Increment>
          </NumberField.Group>
        </NumberField.Root>
        <Button variant="contained" onClick={handleDelegateTurnsToAI} disabled={isButtonDisabled} fullWidth>
          Delegate {turnCount} turn{turnCount !== 1 ? 's' : ''} to AI
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
