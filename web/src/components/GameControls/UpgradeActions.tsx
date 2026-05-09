import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getPlayerActionsApi } from '../../redux/playerActionsApi'
import { ExpandableCard } from '../Common/ExpandableCard'
import { CONTROLS_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { getCurrentTurnState } from '../../redux/storeUtils'

export function UpgradeActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedUpgradeName = useAppSelector((state) => state.selection.selectedUpgradeName)
  const gameState = useAppSelector(getCurrentTurnState)
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState('')

  const api = getPlayerActionsApi(dispatch)

  function handleBuyUpgrade(): void {
    if (selectedUpgradeName === undefined) {
      setAlertMessage('No upgrade selected!')
      setShowAlert(true)
      return
    }

    const result = api.buyUpgrade(gameState, selectedUpgradeName)
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
  }

  return (
    <ExpandableCard
      id="upgrade-actions"
      title="Upgrades"
      defaultExpanded={true}
      sx={{ width: CONTROLS_COLUMN_CARD_WIDTH }}
    >
      <Stack direction="column" spacing={2}>
        <Button variant="contained" onClick={handleBuyUpgrade} disabled={selectedUpgradeName === undefined} fullWidth>
          Buy upgrade
        </Button>
        <Collapse in={showAlert}>
          <Alert
            severity="error"
            onClose={() => setShowAlert(false)}
            sx={{ textAlign: 'center', alignItems: 'center' }}
            aria-label="upgrade-actions-alert"
          >
            {alertMessage}
          </Alert>
        </Collapse>
      </Stack>
    </ExpandableCard>
  )
}
