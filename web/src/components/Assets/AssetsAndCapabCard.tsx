import Stack from '@mui/material/Stack'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { AssetsDataGrid } from './AssetsDataGrid'
import { CapabilitiesDataGrid } from './CapabilitiesDataGrid'

export function AssetsAndCapabCard(): React.JSX.Element {
  return (
    <ExpandableCard title="Assets" defaultExpanded={true}>
      <Stack spacing={2}>
        <AssetsDataGrid />
        <CapabilitiesDataGrid />
      </Stack>
    </ExpandableCard>
  )
}
