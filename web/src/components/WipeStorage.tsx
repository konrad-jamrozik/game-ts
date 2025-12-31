import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { Fragment, useEffect, useState } from 'react'
import { wipeStorage } from '../redux/persist'

type WipeStatus = 'idle' | 'wiping' | 'success' | 'error'

export function WipeStorage(): React.JSX.Element | undefined {
  const [status, setStatus] = useState<WipeStatus>('idle')

  useEffect(() => {
    const pathname = globalThis.location.pathname
    const isWipeRoute = pathname.endsWith('/wipe')

    if (!isWipeRoute) {
      return
    }

    let redirectTimeoutId: ReturnType<typeof setTimeout> | undefined

    const initialTimeoutId = setTimeout(() => {
      setStatus('wiping')
      wipeStorage()
        .then(() => {
          setStatus('success')
          // Wait a moment to show success message, then redirect
          redirectTimeoutId = setTimeout(() => {
            globalThis.location.href = '/game-ts/'
          }, 1500)
        })
        .catch((error: unknown) => {
          console.error('Failed to wipe storage:', error)
          setStatus('error')
        })
    }, 0)

    return (): void => {
      clearTimeout(initialTimeoutId)
      if (redirectTimeoutId !== undefined) {
        clearTimeout(redirectTimeoutId)
      }
    }
  }, [])

  // Only render if we're on the wipe route
  const pathname = globalThis.location.pathname
  if (!pathname.endsWith('/wipe')) {
    return undefined
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      {status === 'wiping' && (
        <Fragment>
          <CircularProgress />
          <Typography variant="h6">Wiping storage...</Typography>
        </Fragment>
      )}
      {status === 'success' && (
        <Fragment>
          <Typography variant="h6" color="success.main">
            Storage wiped! Redirecting...
          </Typography>
        </Fragment>
      )}
      {status === 'error' && (
        <Fragment>
          <Typography variant="h6" color="error.main">
            Failed to wipe storage. Please check the console for details.
          </Typography>
        </Fragment>
      )}
    </Box>
  )
}
