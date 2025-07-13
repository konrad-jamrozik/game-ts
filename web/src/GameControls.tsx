import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'

interface GameControlsProps {
  readonly onAdvanceTurn: () => void
  readonly onResetGame: () => void
}

function GameControls(props: GameControlsProps): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button variant="contained" onClick={props.onAdvanceTurn}>
        advance turn
      </Button>
      <Button variant="contained" color="error" onClick={props.onResetGame}>
        reset game
      </Button>
    </Stack>
  )
}

export default GameControls
