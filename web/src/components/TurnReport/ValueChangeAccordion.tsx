import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Typography } from '@mui/material'
import * as React from 'react'
import type { ValueChange } from '../../lib/model/reportModel'

type ValueChangeAccordionProps = {
  id: string
  title: string
  valueChange: ValueChange
  breakdownContent: React.ReactNode
  expanded: boolean
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void
}

/**
 * Reusable accordion component for displaying value changes with breakdowns
 */
export function ValueChangeAccordion({
  id,
  title,
  valueChange,
  breakdownContent,
  expanded,
  onChange,
}: ValueChangeAccordionProps): React.ReactElement {
  return (
    <Accordion expanded={expanded} onChange={onChange} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${id}-content`} id={`${id}-header`}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ mr: 1 }}>
            {formatValueChange(valueChange)}
          </Typography>
          {formatDelta(valueChange.delta)}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Breakdown:
        </Typography>
        {breakdownContent}
      </AccordionDetails>
    </Accordion>
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
  return <Chip label={`${sign}${delta}`} color={color} size="small" sx={{ ml: 1, fontSize: '0.75rem' }} />
}
