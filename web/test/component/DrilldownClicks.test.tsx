import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { Provider } from 'react-redux'
import { ActionCreators } from 'redux-undo'
import { beforeEach, describe, expect, test } from 'vitest'
import { AgentsDataGrid as OperationsAgentsDataGrid } from '../../src/components/Assets/AssetsDataGrid'
import { MissionsSummaryDataGrid } from '../../src/components/Assets/OperationsSummaryDataGrids'
import { EventLog } from '../../src/components/EventLog'
import { SituationReportContent } from '../../src/components/SituationReportCard'
import type { FactionId, MissionId } from '../../src/lib/model/modelIds'
import { advanceTurn } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { setRevealAllFactionProfiles } from '../../src/redux/slices/settingsSlice'
import { clearAllSelection, openChartsDrilldown } from '../../src/redux/slices/selectionSlice'
import { getStore } from '../../src/redux/store'
import { st } from '../fixtures/stateFixture'

describe('drilldown row clicks', () => {
  beforeEach(() => {
    resetDrilldownTestStore()
  })

  test('clicking the exhausted agents summary row opens the exhausted agents drilldown', async () => {
    renderWithStore(<OperationsAgentsDataGrid />)

    await userEvent.click(screen.getByText('Exhausted'))

    expect(getStore().getState().selection.viewAgents).toBe(true)
    expect(getStore().getState().selection.agentsFilterType).toBe('exhausted')
  })

  test('clicking the expiring soon missions summary row opens the expiring missions drilldown', async () => {
    const missionId = 'mission-1' as MissionId
    st.arrangeGameState({ missions: [st.bldMission(missionId)] })

    renderWithStore(<MissionsSummaryDataGrid />)

    await userEvent.click(screen.getByText('Expiring soon'))

    expect(getStore().getState().selection.viewMissions).toBe(true)
    expect(getStore().getState().selection.missionsFilterType).toBe('expiringSoon')
  })

  test('clicking a situation report faction row opens factions with that faction selected', async () => {
    const store = getStore()
    const factionId = 'faction-red-dawn' as FactionId
    store.dispatch(setRevealAllFactionProfiles(true))

    renderWithStore(<SituationReportContent />)

    await userEvent.click(screen.getByText('Red Dawn'))

    expect(store.getState().selection.viewFactions).toBe(true)
    expect(store.getState().selection.selectedFactionId).toBe(factionId)
  })

  test('clicking the situation report panic row opens current-turn charts', async () => {
    renderWithStore(<SituationReportContent />)

    const panicGrid = screen.getByRole('grid', { name: 'Panic data' })
    await userEvent.click(within(panicGrid).getByText(/%/u))

    expect(getStore().getState().selection.viewCharts).toBe(true)
    expect(getStore().getState().selection.chartsTurnRangeFilter).toBe('currentTurn')
  })

  test('clicking a turn advancement event opens that turn report', async () => {
    const store = getStore()
    store.dispatch(advanceTurn())

    renderWithStore(<EventLog />)

    await userEvent.click(screen.getByText('Advanced to turn 2'))

    expect(store.getState().selection.viewTurnReport).toBe(true)
    expect(store.getState().selection.selectedTurnReportTurn).toBe(2)
  })
})

function resetDrilldownTestStore(): void {
  const store = getStore()
  st.arrangeGameState({})
  store.dispatch(ActionCreators.clearHistory())
  store.dispatch(clearEvents())
  store.dispatch(openChartsDrilldown())
  store.dispatch(clearAllSelection())
  store.dispatch(setRevealAllFactionProfiles(false))
}

function renderWithStore(children: React.ReactNode): void {
  render(<Provider store={getStore()}>{children}</Provider>)
}
