# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Run all commands from the `web/` directory:

- **Build**: `npm run build` - TypeScript compilation and Vite build
- **Format check**: `npm run format` - Check code formatting with Prettier
- **Format fix**: `npm run format:fix` - Fix code formatting issues
- **Lint**: `npm run lint:cached` - Run ESLint with caching
- **Lint fix**: `npm run lint:fix` - Fix ESLint issues automatically
- **Test**: `npm run test` - Run Vitest unit tests
- **Test watch**: `npm run test:watch` - Run tests in watch mode
- **Dev server**: `npm run dev` - Start development server
- **Full check**: `npm run check` - Run format, lint, and tests together

## Code Quality Requirements

**CRITICAL**: Before completing any task that modifies code, you MUST ensure that `npm run lint:cached` passes without errors.
This is a mandatory requirement for all code changes.

### Workflow for Code Changes

1. Make your code changes
2. Run `npm run lint:cached` from the `web/` directory
3. If linting fails, fix all issues using `npm run lint:fix` or manual corrections
4. Verify that `npm run lint:cached` passes before considering the task complete
5. Never commit or consider a task finished while linting errors remain

This ensures code quality and consistency across the entire codebase.

## Architecture Overview

This is a turn-based strategy game built as a client-side React app where players manage agents, investigate leads,
and complete missions against various factions.

### Core Game Concepts

**Game State Structure**:
- **Session**: Turn counter and action tracking
- **Assets**: Money, intel, funding, and agents
- **Situation**: Panic level and faction threat tracking
- **Operations**: Leads investigation and mission sites

**Agent Lifecycle**: Agents progress through states (Available → InTransit → OnAssignment/OnMission → Recovering → Available)
and can be assigned to Contracting (earn money), Espionage (gather intel), or missions.

**Turn Advancement**: Complex multi-step process in `advanceTurnImpl.ts` that updates agent states, processes assignments,
resolves mission combat, applies rewards, and updates faction threat levels.

### State Management

**Redux Architecture**:
- `store.ts` - Main Redux store configuration
- `persist.ts` - IndexedDB persistence using Dexie.js
- `gameStateSlice.ts` - Primary game state with player actions
- `eventsMiddleware.ts` - Records all state changes as events for debugging

**Key Patterns**:
- Player actions wrapped with `asPlayerAction()` for tracking
- Game state mutations through Redux Toolkit slices
- Immutable updates using Immer (built into RTK)

### Domain Model

**Core Types** (in `model/model.ts`):
- `Agent` - Player units with stats, states, and assignments
- `Mission`/`MissionSite` - Available operations and active deployments
- `Lead` - Investigation targets that unlock missions
- `Faction` - Enemy organizations with threat levels and suppression
- `EnemyUnit` - Combat opponents in missions

**Business Logic**:
- `ruleset/` - Game constants and initial state
- `turn_advancement/` - Turn processing and combat system
- `agents/` - Agent state management and validation
- `utils/` - Utility functions for calculations

### Component Architecture

**UI Structure**:
- React functional components with hooks
- MUI components for consistent styling
- Custom `StyledDataGrid` for tabular data
- `ErrorBoundary` for error handling

**Data Flow**:
- Components use `useAppSelector` for state access
- Actions dispatched via `useAppDispatch`
- Selectors in `selectors/` for derived state

## Key Conventions

- **Shell**: Use PowerShell commands (see `.github/copilot-instructions.md` for substitutions)
- **TypeScript**: Modern ES2024 features with strict typing
- **Testing**: Vitest with React Testing Library
- **Styling**: MUI theme in `styling/theme.tsx`
- **Validation**: Game state invariants enforced throughout
- **Combat**: Fair target selection and detailed damage tracking

## Important Files

- `web/src/lib/model/model.ts` - Core type definitions
- `web/src/lib/slices/gameStateSlice.ts` - Main game state logic
- `web/src/lib/turn_advancement/advanceTurnImpl.ts` - Turn processing engine
- `web/src/lib/model/ruleset/ruleset.ts` - Game rules and calculations
- `web/src/components/` - React UI components
- `web/src/lib/collections/` - Static game data (factions, leads, missions)
