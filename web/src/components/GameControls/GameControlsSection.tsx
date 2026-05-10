import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { setCardExpanded } from '../../redux/slices/expansionSlice'

export function GameControlsSection({
  children,
  defaultExpanded = true,
  id,
  title,
}: GameControlsSectionProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const expanded = useAppSelector((state) => state.expansion.cards[id] ?? defaultExpanded)

  function handleAccordionChange(_event: React.SyntheticEvent, isExpanded: boolean): void {
    dispatch(setCardExpanded({ id, expanded: isExpanded }))
  }

  return (
    <Accordion expanded={expanded} onChange={handleAccordionChange} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${id}-content`} id={`${id}-header`}>
        <Typography component="span">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}

type GameControlsSectionProps = {
  id: string
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}
