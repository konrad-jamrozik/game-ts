import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useGameStateContext } from '../contexts/GameStateContextProvider'

export function GameStateDisplay(): React.JSX.Element {
  const { turn, agents, money } = useGameStateContext()
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography id="turn-label" variant="body1">
        Turn
      </Typography>
      <Typography variant="h6" component="span" aria-label="turn" aria-labelledby="turn-label">
        {turn}
      </Typography>

      <Typography id="agents-label" variant="body1">
        Agents
      </Typography>
      <Typography variant="h6" component="span" aria-label="agents" aria-labelledby="agents-label">
        {agents}
      </Typography>

      <Typography id="money-label" variant="body1">
        Money
      </Typography>
      <Typography variant="h6" component="span" aria-label="money" aria-labelledby="money-label">
        {money}
      </Typography>
    </Stack>
  )
}
