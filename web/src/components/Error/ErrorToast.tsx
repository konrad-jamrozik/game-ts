import Alert from '@mui/material/Alert'
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar'
import { startTransition, useEffect, useState } from 'react'

type ErrorToastMessage = {
  message: string
  id: number
}

export function ErrorToast(): React.JSX.Element {
  const [snackPack, setSnackPack] = useState<readonly ErrorToastMessage[]>([])
  const [open, setOpen] = useState(false)
  const [messageInfo, setMessageInfo] = useState<ErrorToastMessage | undefined>()

  useEffect(() => {
    function handleError(event: Event): void {
      if (event instanceof CustomEvent && typeof event.detail === 'string') {
        const errorMessage = event.detail
        const newMessage = { message: errorMessage, id: Date.now() }
        setSnackPack((prev) => {
          const newPack = [...prev, newMessage]
          // If no message is currently displayed, show the first one immediately
          if (prev.length === 0) {
            startTransition(() => {
              setMessageInfo(newMessage)
              setOpen(true)
            })
            return []
          }
          return newPack
        })
      }
    }

    globalThis.addEventListener('error-toast', handleError)
    return (): void => {
      globalThis.removeEventListener('error-toast', handleError)
    }
  }, [])

  useEffect(() => {
    if (snackPack.length > 0 && messageInfo && open) {
      // Close an active snack when a new one is added
      startTransition(() => {
        setOpen(false)
      })
    }
  }, [snackPack.length, messageInfo, open])

  function handleClose(_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason): void {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  function handleExited(): void {
    setMessageInfo(undefined)
    // Process next item in queue after current snackbar exits
    startTransition(() => {
      setSnackPack((prev) => {
        if (prev.length > 0) {
          const [firstMessage, ...rest] = prev
          setMessageInfo(firstMessage)
          setOpen(true)
          return rest
        }
        return prev
      })
    })
  }

  return (
    <Snackbar
      key={messageInfo ? messageInfo.id : undefined}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      slotProps={{ transition: { onExited: handleExited } }}
    >
      <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: '100%' }}>
        {messageInfo ? messageInfo.message : ''}
      </Alert>
    </Snackbar>
  )
}
