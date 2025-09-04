import * as React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { TurnReport } from '../../lib/model/reportModel'
import { ExperimentalTurnReportTree } from './ExperimentalTurnReportTree'

type ExperimentalTurnReportModalProps = {
  open: boolean
  onClose: () => void
  turnReport: TurnReport | undefined
}

/**
 * Modal dialog that displays a turn advancement report using the TurnReportTree component
 */
export function ExperimentalTurnReportModal({
  open,
  onClose,
  turnReport,
}: ExperimentalTurnReportModalProps): React.ReactElement {
  if (!turnReport) {
    return <></>
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="turn-report-modal-title"
      aria-describedby="turn-report-modal-description"
    >
      <DialogTitle id="turn-report-modal-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Turn {turnReport.turn} Report
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ padding: 0 }}>
        <ExperimentalTurnReportTree report={turnReport} />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
