import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Card, CardContent, CardHeader, Chip, Collapse, IconButton, Typography, type SxProps } from '@mui/material'
import * as React from 'react'
import type { GridColDef } from '@mui/x-data-grid'
import type { ValueChange } from '../../lib/model/reportModel'
import theme from '../../styling/theme'
import { StyledDataGrid } from '../StyledDataGrid'

export type BreakdownRow = {
  id: string
  label: string
  value: number
}

type ValueChangeCardProps = {
  id: string
  title: string
  valueChange: ValueChange
  breakdownRows: readonly BreakdownRow[]
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
  breakdownRows,
  expanded,
  onChange,
}: ValueChangeCardProps): React.ReactElement {
  function handleExpandClick(event: React.SyntheticEvent): void {
    onChange(event, !expanded)
  }

  const nestedCardContentSx: SxProps = { backgroundColor: theme.palette.background.nestedCardContent }

  const columns: GridColDef[] = [
    { field: 'label', headerName: 'Item', flex: 1.3, headerAlign: 'right', align: 'right' },
    {
      field: 'value',
      headerName: 'Amount',
      flex: 1,
      renderCell: (params): React.ReactNode => {
        const value = typeof params.value === 'number' ? params.value : 0
        const color = value > 0 ? 'success' : value < 0 ? 'error' : 'default'
        const sign = value >= 0 ? '+' : ''
        return <Chip label={`${sign}${value}`} color={color} size="small" sx={{ fontSize: '0.875rem', height: 18 }} />
      },
    },
  ]

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
              {title}:
            </Typography>
            <Typography variant="h6" component="span">
              {formatValueChange(valueChange)}
            </Typography>
            {formatDelta(valueChange.delta)}
          </Box>
        }
        slotProps={{ title: { variant: 'h6' } }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={nestedCardContentSx}>
          <StyledDataGrid rows={breakdownRows} columns={columns} />
        </CardContent>
      </Collapse>
    </Card>
  )
}

/**
 * Format a ValueChange as "previous → current (±delta)"
 */
function formatValueChange(change: ValueChange): string {
  return `${change.previous} → ${change.current}`
}

/**
 * Format a delta value with appropriate styling
 */
function formatDelta(delta: number): React.ReactNode {
  const color = delta > 0 ? 'success' : delta < 0 ? 'error' : 'default'
  const sign = delta >= 0 ? '+' : ''
  return <Chip label={`${sign}${delta}`} color={color} sx={{ fontSize: '1rem' }} />
}
