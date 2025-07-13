import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

interface GameControlsProps {
  onAdvanceTurn: () => void
  onResetGame: () => void
}

function GameControls({ onAdvanceTurn, onResetGame }: GameControlsProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button variant="contained" onClick={onAdvanceTurn}>
        advance turn
      </Button>
      <Button variant="contained" color="error" onClick={onResetGame}>
        reset game
      </Button>
    </Stack>
  )
}

export default GameControls
