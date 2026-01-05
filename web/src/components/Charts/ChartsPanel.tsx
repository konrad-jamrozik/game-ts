import * as React from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInIcon from '@mui/icons-material/ZoomIn'

const CHART_HEIGHT = 300

function getFullscreenHeight(): number {
  if (typeof globalThis !== 'undefined' && 'innerHeight' in globalThis) {
    const windowLike = globalThis as { innerHeight: number }
    return windowLike.innerHeight - 100
  }
  return 600
}

type ChartsPanelProps = {
  title: string
  renderChart: (height: number) => React.ReactNode
  headerControls?: React.ReactNode
}

export function ChartsPanel(props: ChartsPanelProps): React.JSX.Element {
  const [zoomed, setZoomed] = React.useState(false)

  function handleZoomClick(): void {
    setZoomed(true)
  }

  function handleCloseZoom(): void {
    setZoomed(false)
  }

  function handleDialogKeyDown(event: React.KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation()
      handleCloseZoom()
    }
  }

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          height: '100%',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="h6">{props.title}</Typography>
              {props.headerControls}
            </Box>
            <IconButton onClick={handleZoomClick} aria-label="Zoom in" size="small">
              <ZoomInIcon />
            </IconButton>
          </Box>
          <Box sx={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {props.renderChart(CHART_HEIGHT)}
          </Box>
        </Stack>
      </Paper>
      <Dialog fullScreen open={zoomed} onClose={handleCloseZoom} onKeyDown={handleDialogKeyDown}>
        <Paper elevation={2} sx={{ position: 'relative', height: '100%', p: 2 }}>
          <IconButton
            onClick={handleCloseZoom}
            aria-label="Close"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'red',
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {props.title}
          </Typography>
          <Box sx={{ height: 'calc(100% - 60px)' }}>{props.renderChart(getFullscreenHeight())}</Box>
        </Paper>
      </Dialog>
    </>
  )
}
