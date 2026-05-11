import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getPlayerActionsApi } from '../../redux/playerActionsApi'
import { SCREEN_ACTIONS_COLUMN_WIDTH } from '../Common/dataGridLayout'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { SECTION_GAP } from '../styling/spacing'

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
    <Stack direction="column" spacing={SECTION_GAP} sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}>
      <Button variant="contained" onClick={handleBuyUpgrade} disabled={selectedUpgradeName === undefined} fullWidth>
        Buy upgrade
      </Button>
      {showAlert && (
        <Alert
          severity="error"
          onClose={() => setShowAlert(false)}
          sx={{ textAlign: 'center', alignItems: 'center' }}
          aria-label="upgrade-actions-alert"
        >
          {alertMessage}
        </Alert>
      )}
    </Stack>
  )
}
