import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import { useState } from 'react'

type ExpandableCardProps = {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  sx?: Record<string, unknown> // KJA should be SxProps
}

const defaultSx = {}

/**
 * Reusable expandable card component that encapsulates the expand/collapse logic
 */
export function ExpandableCard({
  title,
  children,
  defaultExpanded = true,
  sx = defaultSx,
}: ExpandableCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(defaultExpanded)

  function handleExpandClick(): void {
    setExpanded(!expanded)
  }

  return (
    <Card sx={sx}>
      <CardHeader
        avatar={
          <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        title={title}
        slotProps={{ title: { variant: 'h5' } }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{children}</CardContent>
      </Collapse>
    </Card>
  )
}
