import Button from '@mui/material/Button'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { decrement, incrementByAmount } from './counterSlice'

export function Counter(): React.JSX.Element {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div>
      <div>
        <Button aria-label="Increment value" onClick={() => dispatch(incrementByAmount(1))}>
          Increment
        </Button>
        <span>{count}</span>
        <Button aria-label="Decrement value" onClick={() => dispatch(decrement())}>
          Decrement
        </Button>
      </div>
    </div>
  )
}
