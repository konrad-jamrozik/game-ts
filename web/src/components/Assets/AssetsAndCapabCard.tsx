import Stack from '@mui/material/Stack'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { RIGHT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { AssetsDataGrid } from './AssetsDataGrid'
import { CapabilitiesDataGrid } from './CapabilitiesDataGrid'

export function AssetsAndCapabCard(): React.JSX.Element {
  return (
    <ExpandableCard title="Assets" defaultExpanded={true} sx={{ width: RIGHT_COLUMN_CARD_WIDTH }}>
      <Stack spacing={2}>
        <AssetsDataGrid />
        <CapabilitiesDataGrid />
      </Stack>
    </ExpandableCard>
  )
}
