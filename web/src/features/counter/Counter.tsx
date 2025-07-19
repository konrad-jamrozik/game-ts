import Button from '@mui/material/Button'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import { decrement, increment } from './counterSlice'

export function Counter(): React.JSX.Element {
  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <div>
      <div>
        <Button aria-label="Increment value" onClick={() => dispatch(increment())}>
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
