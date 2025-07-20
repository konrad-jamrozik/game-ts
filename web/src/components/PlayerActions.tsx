import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch } from '../app/hooks'
import { hireAgent } from '../model/gameStateSlice'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()

  return (
    <Card>
      <CardHeader title="Player actions" />
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => dispatch(hireAgent())}>
            hire agent
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
