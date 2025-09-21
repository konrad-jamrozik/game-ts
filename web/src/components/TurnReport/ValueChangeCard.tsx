import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Card, CardContent, CardHeader, Chip, Collapse, IconButton, Typography, type SxProps } from '@mui/material'
import * as React from 'react'
import type { GridColDef } from '@mui/x-data-grid'
import type { ValueChange } from '../../lib/model/reportModel'
import theme from '../../styling/theme'
import { StyledDataGrid } from '../StyledDataGrid'
import { fmtPctDiv100Dec2 } from '../../lib/utils/formatUtils'

/**
 * Type guard for BreakdownRow
 */
function isBreakdownRow(obj: unknown): obj is BreakdownRow {
  return obj !== null && typeof obj === 'object' && 'id' in obj && 'label' in obj && 'value' in obj
}

export type BreakdownRow = {
  id: string
  label: string
  value: number
  /** Special flag to mark suppression-related items that should use normal color semantics */
  isSuppressionType?: boolean
}

type ValueChangeCardProps = {
  id: string
  title: string
  valueChange: ValueChange
  breakdownRows: readonly BreakdownRow[]
  expanded: boolean
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void
  /** Reverse color semantics: increases are bad (red), decreases are good (green) */
  reverseColors?: boolean
  /** Show percentage change instead of absolute values */
  showPercentage?: boolean
  /** When showPercentage is true, show only percentage values (hide integer values) */
  percentageOnly?: boolean
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
  reverseColors = false,
  showPercentage = false,
  percentageOnly = false,
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
        const row = isBreakdownRow(params.row) ? params.row : undefined

        // Apply color logic: suppression items use normal colors, others use reverseColors if specified
        const shouldReverse = reverseColors && !(row?.isSuppressionType ?? false)
        const color: 'success' | 'error' | 'default' =
          value === 0 ? 'default' : shouldReverse ? (value > 0 ? 'error' : 'success') : value > 0 ? 'success' : 'error'

        const sign = value >= 0 ? '+' : ''
        const displayValue = showPercentage ? fmtPctDiv100Dec2(value) : `${sign}${value}`
        return <Chip label={displayValue} color={color} size="small" sx={{ fontSize: '0.875rem', height: 18 }} />
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
              {formatValueChange(valueChange, showPercentage, percentageOnly)}
            </Typography>
            {!percentageOnly && formatDelta(valueChange.delta, reverseColors, showPercentage)}
            {showPercentage && percentageOnly && formatPercentageDelta(valueChange, reverseColors)}
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
 * Format a ValueChange as "previous → current"
 */
function formatValueChange(change: ValueChange, showPercentage = false, percentageOnly = false): string {
  if (showPercentage && percentageOnly) {
    return `${fmtPctDiv100Dec2(change.previous)} → ${fmtPctDiv100Dec2(change.current)}`
  }
  return `${change.previous} → ${change.current}`
}

/**
 * Format a delta value with appropriate styling
 */
function formatDelta(delta: number, reverseColors = false, showPercentage = false): React.ReactNode {
  const color: 'success' | 'error' | 'default' =
    delta === 0 ? 'default' : reverseColors ? (delta > 0 ? 'error' : 'success') : delta > 0 ? 'success' : 'error'
  const sign = delta >= 0 ? '+' : ''
  const displayValue = showPercentage ? fmtPctDiv100Dec2(delta) : `${sign}${delta}`
  return <Chip label={displayValue} color={color} sx={{ fontSize: '1rem' }} />
}

/**
 * Format percentage delta for percentage-only mode
 */
function formatPercentageDelta(change: ValueChange, reverseColors = false): React.ReactNode {
  const { delta } = change
  if (delta === 0) return <Chip label="no change" color="default" sx={{ fontSize: '1rem' }} />

  const color: 'success' | 'error' | 'default' = reverseColors
    ? delta > 0
      ? 'error'
      : 'success'
    : delta > 0
      ? 'success'
      : 'error'

  return <Chip label={fmtPctDiv100Dec2(delta)} color={color} sx={{ fontSize: '1rem' }} />
}
