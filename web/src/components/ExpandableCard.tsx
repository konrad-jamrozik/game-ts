import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { SxProps, Theme } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import { useState } from 'react'
import theme from '../styling/theme'

type ExpandableCardProps = {
  title: string
  children: React.ReactNode
  nested?: boolean
  defaultExpanded?: boolean
  sx?: SxProps<Theme>
}

const defaultSx: SxProps<Theme> = {}

/**
 * Reusable expandable card component that encapsulates the expand/collapse logic
 */
export function ExpandableCard({
  title,
  children,
  nested = false,
  defaultExpanded = true,
  sx = defaultSx,
}: ExpandableCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const nestedCardContentSx: SxProps<Theme> = { backgroundColor: theme.palette.background.nestedCardContent }

  function handleExpandClick(): void {
    setExpanded(!expanded)
  }

  return (
    <Card sx={sx}>
      <CardHeader
        avatar={
          <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more" size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        title={title}
        slotProps={{ title: { variant: 'h6' } }}
        sx={{ paddingY: 0.75 }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={nested ? nestedCardContentSx : defaultSx}>{children}</CardContent>
      </Collapse>
    </Card>
  )
}
