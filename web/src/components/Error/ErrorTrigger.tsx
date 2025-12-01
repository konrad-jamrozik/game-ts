import { Button } from '@mui/material'
import { useState } from 'react'

/**
 * Test component that can trigger an error for testing the ErrorBoundary
 */
export function ErrorTrigger(): React.JSX.Element {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('Test error triggered intentionally')
  }

  return (
    <Button
      variant="outlined"
      color="error"
      onClick={() => {
        setShouldError(true)
      }}
      sx={{ margin: 1 }}
    >
      Test Error Boundary
    </Button>
  )
}
