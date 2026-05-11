import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { GridColDef, GridRenderCellParams, GridRowClassNameParams, GridRowParams } from '@mui/x-data-grid'
import * as React from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import type { RootReducerState, UndoableCombinedState } from '../redux/rootReducer'
import { StyledDataGrid } from './Common/StyledDataGrid'
import { columnWidths } from './Common/columnWidths'
import { EVENT_LOG_DATA_GRID_WIDTH } from './Common/widthConstants'
import type { EventNavigationTarget, GameEvent } from '../redux/slices/eventsSlice'
import { assertDefined, assertEqual } from '../lib/primitives/assertPrimitives'
import { f6str } from '../lib/model_utils/formatUtils'
import { EVENT_LOG_TIME_TRAVEL_BUTTON_PADDING_X, EVENT_LOG_TIME_TRAVEL_BUTTON_PADDING_Y } from './styling/spacing'
import type { AppDispatch } from '../redux/store'
import {
  openAgentsDrilldown,
  openLeadsDrilldown,
  openMissionsDrilldown,
  openTurnReportDrilldown,
  openUpgradesDrilldown,
} from '../redux/slices/selectionSlice'
import { combineSx, getClickableRowSx } from './styling/stylePrimitives'

export function EventLog(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const events = useAppSelector((state) => state.events.events)
  const undoable = useAppSelector((state: RootReducerState) => state.undoable)
  const rows = getEventLogRows(events, undoable)
  const columns = getEventLogColumns(handleJump)

  function handleJump(offset: number): void {
    dispatch(ActionCreators.jump(offset))
  }

  function handleRowClick(params: GridRowParams<EventLogRow>): void {
    const { navigationTarget } = params.row
    if (navigationTarget === undefined) {
      return
    }
    dispatchEventNavigationTarget(dispatch, navigationTarget)
  }

  return (
    <Box sx={{ width: EVENT_LOG_DATA_GRID_WIDTH }}>
      <Typography variant="h6" component="div" sx={{ paddingX: 1, paddingY: 0.5 }}>
        Event Log
      </Typography>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        aria-label="Event Log"
        getRowClassName={getEventLogRowClassName}
        onRowClick={handleRowClick}
        sx={combineSx(getClickableRowSx('& .event-log-clickable-row'), (theme) => ({
          '& .event-log-undone-row .MuiDataGrid-cell:not([data-field="timeTravelAction"])': {
            color: theme.palette.text.disabled,
          },
        }))}
      />
    </Box>
  )
}

type EventLogRow = {
  id: number
  event: string
  turn: number
  actionsCount: number | ''
  timeTravelAction: TimeTravelAction | undefined
  jumpOffset: number | undefined
  navigationTarget: EventNavigationTarget | undefined
}

type TimeTravelAction = 'Undo' | 'Redo'

type TimelinePoint = {
  turn: number
  actionsCount: number
}

type TimeTravelTarget = {
  action: TimeTravelAction
  offset: number | undefined
}

function getEventLogRows(events: GameEvent[], undoable: RootReducerState['undoable']): EventLogRow[] {
  const timeline = getTimeline(undoable)
  const presentIndex = undoable.past.length
  return events.map((event) => {
    const hasActionControls = hasEventActionControls(event)
    const target = hasActionControls ? getTimeTravelTarget(event, timeline, presentIndex) : undefined
    return {
      id: event.id,
      event: renderPrimaryListItemText(event),
      turn: event.turn,
      actionsCount: hasActionControls ? event.actionsCount : '',
      timeTravelAction: target?.action,
      jumpOffset: target?.offset,
      navigationTarget: getEventNavigationTarget(event),
    }
  })
}

function getEventLogColumns(onJump: (offset: number) => void): GridColDef<EventLogRow>[] {
  return [
    { field: 'turn', headerName: 'T#', width: columnWidths['event_log.turn'] },
    { field: 'actionsCount', headerName: 'A#', width: columnWidths['event_log.actions_count'] },
    { field: 'event', headerName: 'Event', width: columnWidths['event_log.event'] },
    {
      field: 'timeTravelAction',
      headerName: '',
      width: columnWidths['event_log.undo'],
      sortable: false,
      renderCell: (params: GridRenderCellParams<EventLogRow, TimeTravelAction | undefined>): React.JSX.Element | undefined =>
        renderTimeTravelButton(params, onJump),
    },
  ]
}

function getEventLogRowClassName(params: GridRowClassNameParams<EventLogRow>): string {
  const classNames: string[] = []
  if (params.row.timeTravelAction === 'Redo') {
    classNames.push('event-log-undone-row')
  }
  if (params.row.navigationTarget !== undefined) {
    classNames.push('event-log-clickable-row')
  }
  return classNames.join(' ')
}

function renderTimeTravelButton(
  params: GridRenderCellParams<EventLogRow, TimeTravelAction | undefined>,
  onJump: (offset: number) => void,
): React.JSX.Element | undefined {
  const { jumpOffset, timeTravelAction } = params.row
  if (timeTravelAction === undefined) {
    return undefined
  }
  const handleClick = jumpOffset === undefined ? undefined : createTimeTravelClickHandler(jumpOffset, onJump)
  const isUndo = timeTravelAction === 'Undo'
  return (
    <Box
      onClick={stopClickPropagation}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}
    >
      <Button
        variant="outlined"
        size="small"
        disabled={jumpOffset === undefined}
        onClick={handleClick}
        sx={(theme) => ({
          paddingX: EVENT_LOG_TIME_TRAVEL_BUTTON_PADDING_X,
          paddingY: EVENT_LOG_TIME_TRAVEL_BUTTON_PADDING_Y,
          minHeight: 24,
          ...(isUndo && {
            borderColor: theme.palette.primary.light,
            color: theme.palette.primary.light,
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          }),
        })}
      >
        {timeTravelAction}
      </Button>
    </Box>
  )
}

function createTimeTravelClickHandler(
  offset: number,
  onJump: (offset: number) => void,
): (event: React.MouseEvent<HTMLButtonElement>) => void {
  return function handleTimeTravelClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation()
    onJump(offset)
  }
}

function stopClickPropagation(event: React.MouseEvent): void {
  event.stopPropagation()
}

function dispatchEventNavigationTarget(dispatch: AppDispatch, target: EventNavigationTarget): void {
  switch (target.type) {
    case 'AgentsDrilldown': {
      dispatch(openAgentsDrilldown(target.filter))
      return
    }
    case 'LeadsDrilldown': {
      dispatch(openLeadsDrilldown(target.filter))
      return
    }
    case 'MissionsDrilldown': {
      dispatch(openMissionsDrilldown(target.filter))
      return
    }
    case 'TurnReportDrilldown': {
      dispatch(openTurnReportDrilldown(target.turn))
      return
    }
    case 'UpgradesDrilldown': {
      dispatch(openUpgradesDrilldown(target.upgradeName))
    }
  }
}

function getEventNavigationTarget(event: GameEvent): EventNavigationTarget | undefined {
  if (event.navigationTarget !== undefined) {
    return event.navigationTarget
  }
  if (event.type === 'TurnAdvancement') {
    return { type: 'TurnReportDrilldown', turn: event.turn }
  }
  if (event.type === 'MissionCompleted') {
    return { type: 'MissionsDrilldown', filter: 'archived' }
  }
  assertEqual(event.type, 'Text')
  return undefined
}

function hasEventActionControls(event: GameEvent): boolean {
  return event.eventRowControl !== 'WorldEvent'
}

function getTimeTravelTarget(
  event: GameEvent,
  timeline: UndoableCombinedState[],
  presentIndex: number,
): TimeTravelTarget {
  const presentState = timeline[presentIndex]
  assertDefined(presentState)
  const presentPoint = getTimelinePoint(presentState)
  const eventPoint = getEventPoint(event)
  const eventStateIndex = findTimelinePointIndex(timeline, eventPoint)

  if (isAfterTimelinePoint(eventPoint, presentPoint)) {
    return {
      action: 'Redo',
      offset: getOffset(eventStateIndex, presentIndex),
    }
  }

  return {
    action: 'Undo',
    offset: getOffset(eventStateIndex === undefined ? undefined : eventStateIndex - 1, presentIndex),
  }
}

function getTimeline(undoable: RootReducerState['undoable']): UndoableCombinedState[] {
  return [...undoable.past, undoable.present, ...undoable.future]
}

function getTimelinePoint(state: UndoableCombinedState): TimelinePoint {
  return {
    turn: state.gameState.turn,
    actionsCount: state.gameState.actionsCount,
  }
}

function getEventPoint(event: GameEvent): TimelinePoint {
  return {
    turn: event.turn,
    actionsCount: event.actionsCount,
  }
}

function findTimelinePointIndex(timeline: UndoableCombinedState[], point: TimelinePoint): number | undefined {
  const index = timeline.findIndex((state) => isSameTimelinePoint(getTimelinePoint(state), point))
  return index === -1 ? undefined : index
}

function getOffset(targetIndex: number | undefined, presentIndex: number): number | undefined {
  if (targetIndex === undefined || targetIndex < 0) {
    return undefined
  }
  return targetIndex - presentIndex
}

function isAfterTimelinePoint(point: TimelinePoint, other: TimelinePoint): boolean {
  return point.turn > other.turn || (point.turn === other.turn && point.actionsCount > other.actionsCount)
}

function isSameTimelinePoint(point: TimelinePoint, other: TimelinePoint): boolean {
  return point.turn === other.turn && point.actionsCount === other.actionsCount
}

function renderPrimaryListItemText(event: GameEvent): string {
  if (event.type === 'Text') {
    return event.message
  }
  if (event.type === 'TurnAdvancement') {
    return `Advanced to turn ${event.turn}`
  }
  assertEqual(event.type, 'MissionCompleted')
  const won = event.finalState === 'Won'
  const rewardsSummary = won ? formatMissionRewards(event) : ''
  const base = `Mission ${event.missionId} "${event.missionName}"`
  const msg = rewardsSummary ? `${base} won: ${rewardsSummary}` : `${base} ${event.finalState.toLowerCase()}.`
  return msg
}

function formatMissionRewards(event: Extract<GameEvent, { type: 'MissionCompleted' }>): string {
  const { rewards } = event
  const parts: string[] = []
  if (rewards.money !== undefined) parts.push(`+$${rewards.money}`)
  if (rewards.funding !== undefined) parts.push(`+${rewards.funding} funding`)
  if (rewards.panicReduction !== undefined) {
    parts.push(`-${f6str(rewards.panicReduction)}% panic`)
  }
  return parts.join(', ')
}
