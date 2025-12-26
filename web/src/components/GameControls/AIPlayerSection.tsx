import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { ExpandableCard } from '../Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { isGameOver, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { delegateTurnToAIPlayer } from '../../lib/ai/delegateTurnToAIPlayer'
import { getAllIntellectNames, getIntellect } from '../../lib/ai/intellectRegistry'

export function AIPlayerSection(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const [selectedIntellect, setSelectedIntellect] = React.useState<string>('basic')

  const gameOver = isGameOver(gameState)
  const gameWon = isGameWon(gameState)
  const isGameEnded = gameOver || gameWon

  const intellectNames = getAllIntellectNames()
  const intellects = intellectNames.map((name) => getIntellect(name))

  function handleIntellectChange(event: SelectChangeEvent<string>): void {
    setSelectedIntellect(event.target.value)
  }

  function handleDelegateToAI(): void {
    delegateTurnToAIPlayer(selectedIntellect)
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
            {intellects.map((intellect) => (
              <MenuItem key={intellect.name} value={intellect.name}>
                {intellect.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleDelegateToAI} disabled={isGameEnded} fullWidth>
          Delegate to AI
        </Button>
      </Stack>
    </ExpandableCard>
  )
}
