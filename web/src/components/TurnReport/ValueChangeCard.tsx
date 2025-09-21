import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Card, CardContent, CardHeader, Chip, Collapse, IconButton, Typography, type SxProps } from '@mui/material'
import * as React from 'react'
import type { ValueChange } from '../../lib/model/reportModel'
import theme from '../../styling/theme'

type ValueChangeCardProps = {
  id: string
  title: string
  valueChange: ValueChange
  breakdownContent: React.ReactNode
  expanded: boolean
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void
}

/**
 * Reusable card component for displaying value changes with breakdowns
 */
export function ValueChangeCard({
  id,
  title,
  valueChange,
  breakdownContent,
  expanded,
  onChange,
}: ValueChangeCardProps): React.ReactElement {
  function handleExpandClick(event: React.SyntheticEvent): void {
    onChange(event, !expanded)
  }

  const nestedCardContentSx: SxProps = { backgroundColor: theme.palette.background.nestedCardContent }

  return (
    <Card>
      <CardHeader
        avatar={
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label={`expand ${title}`}
            aria-controls={`${id}-content`}
            id={`${id}-header`}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="span">
              {title}
            </Typography>
            <Typography variant="body1" component="span">
              {formatValueChange(valueChange)}
            </Typography>
            {formatDelta(valueChange.delta)}
          </Box>
        }
        slotProps={{ title: { variant: 'h6' } }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={nestedCardContentSx}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Breakdown:
          </Typography>
          {breakdownContent}
        </CardContent>
      </Collapse>
    </Card>
  )
}

/**
 * Format a ValueChange as "previous → current (±delta)"
 */
function formatValueChange(change: ValueChange): string {
  const deltaSign = change.delta >= 0 ? '+' : ''
  return `${change.previous} → ${change.current} (${deltaSign}${change.delta})`
}

/**
 * Format a delta value with appropriate styling
 */
function formatDelta(delta: number): React.ReactNode {
  const color = delta > 0 ? 'success' : delta < 0 ? 'error' : 'default'
  const sign = delta >= 0 ? '+' : ''
  return <Chip label={`${sign}${delta}`} color={color} size="small" sx={{ fontSize: '0.75rem' }} />
}
