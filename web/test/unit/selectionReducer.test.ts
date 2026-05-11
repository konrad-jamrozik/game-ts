import { describe, expect, test } from 'vitest'
import type { FactionId } from '../../src/lib/model/modelIds'
import selectionReducer, {
  openAgentsDrilldown,
  openChartsDrilldown,
  openFactionsDrilldown,
  openLeadsDrilldown,
  openMissionsDrilldown,
  openTurnReportDrilldown,
  openUpgradesDrilldown,
  type SelectionState,
} from '../../src/redux/slices/selectionSlice'

describe('selection drilldown reducers', () => {
  test('openAgentsDrilldown opens agents with the requested filter', () => {
    const state = reduceFromOtherView(openAgentsDrilldown('exhausted'))

    expect(state.viewAgents).toBe(true)
    expect(state.agentsFilterType).toBe('exhausted')
    expectOtherViewsToBeClosed(state, 'viewAgents')
  })

  test('openMissionsDrilldown opens missions with the requested filter', () => {
    const state = reduceFromOtherView(openMissionsDrilldown('expiringSoon'))

    expect(state.viewMissions).toBe(true)
    expect(state.missionsFilterType).toBe('expiringSoon')
    expectOtherViewsToBeClosed(state, 'viewMissions')
  })

  test('openLeadsDrilldown opens active leads with the requested drilldown filter', () => {
    const state = reduceFromOtherView(openLeadsDrilldown('activeInvestigations'))

    expect(state.viewLeads).toBe(true)
    expect(state.leadsFilterType).toBe('active')
    expect(state.leadsDrilldownFilter).toBe('activeInvestigations')
    expectOtherViewsToBeClosed(state, 'viewLeads')
  })

  test('openTurnReportDrilldown opens the historical turn report', () => {
    const state = reduceFromOtherView(openTurnReportDrilldown(7))

    expect(state.viewTurnReport).toBe(true)
    expect(state.selectedTurnReportTurn).toBe(7)
    expectOtherViewsToBeClosed(state, 'viewTurnReport')
  })

  test('openFactionsDrilldown opens factions and stores optional faction selection', () => {
    const factionId = 'faction-red-dawn' as FactionId
    const selectedState = reduceFromOtherView(openFactionsDrilldown(factionId))
    const unselectedState = selectionReducer(selectedState, openFactionsDrilldown())

    expect(selectedState.viewFactions).toBe(true)
    expect(selectedState.selectedFactionId).toBe(factionId)
    expectOtherViewsToBeClosed(selectedState, 'viewFactions')
    expect(unselectedState.selectedFactionId).toBeUndefined()
  })

  test('openChartsDrilldown opens charts and stores optional turn range filter', () => {
    const currentTurnState = reduceFromOtherView(openChartsDrilldown('currentTurn'))
    const allTurnsState = selectionReducer(currentTurnState, openChartsDrilldown())

    expect(currentTurnState.viewCharts).toBe(true)
    expect(currentTurnState.chartsTurnRangeFilter).toBe('currentTurn')
    expectOtherViewsToBeClosed(currentTurnState, 'viewCharts')
    expect(allTurnsState.chartsTurnRangeFilter).toBeUndefined()
  })

  test('openUpgradesDrilldown opens upgrades and stores optional upgrade selection', () => {
    const upgradeState = reduceFromOtherView(openUpgradesDrilldown('Agent cap'))
    const allUpgradesState = selectionReducer(upgradeState, openUpgradesDrilldown())

    expect(upgradeState.viewUpgrades).toBe(true)
    expect(upgradeState.selectedUpgradeName).toBe('Agent cap')
    expectOtherViewsToBeClosed(upgradeState, 'viewUpgrades')
    expect(allUpgradesState.selectedUpgradeName).toBeUndefined()
  })
})

type SelectionAction = ReturnType<
  | typeof openAgentsDrilldown
  | typeof openMissionsDrilldown
  | typeof openLeadsDrilldown
  | typeof openTurnReportDrilldown
  | typeof openFactionsDrilldown
  | typeof openChartsDrilldown
  | typeof openUpgradesDrilldown
>

type SelectionViewFlag =
  | 'viewLeads'
  | 'viewCharts'
  | 'viewMissions'
  | 'viewAgents'
  | 'viewUpgrades'
  | 'viewTurnReport'
  | 'viewFactions'

function reduceFromOtherView(action: SelectionAction): SelectionState {
  return selectionReducer({ agents: [], viewCharts: true, viewMissionDetailsId: 'mission-1' }, action)
}

function expectOtherViewsToBeClosed(state: SelectionState, openView: SelectionViewFlag): void {
  const viewFlags: SelectionViewFlag[] = [
    'viewLeads',
    'viewCharts',
    'viewMissions',
    'viewAgents',
    'viewUpgrades',
    'viewTurnReport',
    'viewFactions',
  ]
  const closedViewFlags = viewFlags.filter((viewFlag) => viewFlag !== openView)

  for (const viewFlag of closedViewFlags) {
    expect(state[viewFlag]).toBeUndefined()
  }
  expect(state.viewMissionDetailsId).toBeUndefined()
}
