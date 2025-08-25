# Implementation Plan for Backlog Items

## Overview

This document outlines the implementation strategy for all items in the backlog.md file, including estimates,
recommended models, and clarification questions.

## Key Decisions Made

1. **Mission Results Storage**: Store like events (single instance, not copied)
2. **File Naming**: Rename files to match function names
3. **Lead Expiration**: Implement with no warnings, permanent removal
4. **State Hierarchy**: Session/Situation/Assets/Liabilities/Archive structure
5. **Save Compatibility**: No backward compatibility required
6. **Error Handling**: Fail fast with assertions, add error boundary
7. **Test Fixtures**: Use Fixture pattern instead of builders/factories
8. **Bundle Strategy**: Load everything at once, no lazy loading
9. **Mission UI**: New supplementary component, stored in state

## Outstanding KJA TODOs

### 2. Display agent results for mission sites

**Location**: `web/src/app/eventsMiddleware.ts:95`
**Task**: Make agent results available after deployed mission site updates
**Confidence**: 70% - Requires state management changes
**Recommended Model**: Opus
**Estimated Time**: 30-45 minutes (AI), 2-3 hours (human)
**Plan**:
1. Create new state slice for mission results (similar to events storage)
2. Store complete combat log with all rounds and final battle results
3. Capture same info as currently in console.log
4. Store mission evaluation results in persisted state like events (single instance, not copied)
5. Update events middleware to reference stored results
6. Ensure results persist across sessions

## Features

### Lead Expiration Logic

**Task**: Implement lead expiration logic
**Confidence**: 60% - Complex feature with game balance implications
**Recommended Model**: Opus
**Estimated Time**: 45-60 minutes (AI), 3-4 hours (human)
**Plan**:
1. Add expiration turn counter to Lead type
2. Implement expiration check during turn evaluation
3. Remove expired leads from available pool (gone forever)
4. No UI warnings or indicators before expiration
5. Update lead generation to set appropriate expiration values
6. Note: Leads may reappear later based on conditions (future feature)

## Domain Model Improvements

### 1. LeadsView Implementation

**Task**: Create LeadsView similar to AgentsView
**Confidence**: 90% - Clear pattern to follow
**Recommended Model**: Sonnet
**Estimated Time**: 20-30 minutes (AI), 2 hours (human)
**Plan**:
1. Create `LeadsView` class in collections/views
2. Implement methods:
   - `withId(id: string): Lead`
   - `isInvestigated(id: string): boolean`
   - `getInvestigationCount(id: string): number`
3. Replace idioms like `leadInvestigationCounts[lead.id] ?? 0` with LeadsView methods
4. Replace `getLeadById(leadId)` calls with LeadsView
5. Update selectors to use LeadsView

### 2. Hierarchize Game State

**Task**: Organize game state structure per comments
**Confidence**: 75% - Requires careful refactoring
**Recommended Model**: Opus
**Estimated Time**: 45-60 minutes (AI), 3-4 hours (human)
**Plan**:
1. Restructure GameState into five top-level sections:
   - Session (turn counter, action tracking)
   - Situation (panic, faction threats)
   - Assets (money, intel, agents)
   - Liabilities (active missions, deployments)
   - Archive (events, mission results)
2. Move existing properties to appropriate sections
3. Update all selectors and reducers for new paths
4. No save game migration needed (breaking change acceptable)

### 3. Migrate MissionSiteUtils to MissionSitesView

**Task**: Convert utility functions to view pattern
**Confidence**: 85%
**Recommended Model**: Sonnet
**Estimated Time**: 15-20 minutes (AI), 1.5 hours (human)
**Plan**:
1. Create MissionSitesView class
2. Move utility functions as methods
3. Update all imports and usages

### 4. Restrict assertDefined Usage

**Task**: Limit assertDefined to domain model collections only
**Confidence**: 70% - Requires extensive refactoring
**Recommended Model**: Opus
**Estimated Time**: 60-90 minutes (AI), 4-5 hours (human)
**Plan**:
1. Audit all assertDefined usages outside domain collections
2. Move assertDefined usage into domain model collections only
3. Update functions to never return undefined (use .Single() pattern)
4. Create AssertionErrorBoundary component (similar to ErrorBoundary.tsx)
5. Display stack trace and assertion failure message in UI
6. Keep fail-fast behavior (throw on assertion failure)

## Documentation

### Reference Doc for Critical Components

**Task**: Create reference documentation
**Confidence**: 95%
**Recommended Model**: Sonnet
**Estimated Time**: 10-15 minutes (AI), 1 hour (human)
**Plan**:
1. Create `docs/reference/critical_components.md`
2. Document:
   - evalTurn (after rename)
   - Combat system
   - State management patterns
   - Event system
3. Update AI instructions (CLAUDE.md) to reference new docs

## Performance Optimization

### 1. ImmutableStateInvariantMiddleware Warning

**Task**: Address slow middleware in development
**Confidence**: 90%
**Recommended Model**: Sonnet
**Estimated Time**: 10-15 minutes (AI), 1 hour (human)
**Plan**:
1. Analyze state size and complexity
2. Configure middleware threshold or disable for large operations
3. Add conditional middleware configuration

### 2. Bundle Size Optimization

**Task**: Reduce chunk sizes below 500KB
**Confidence**: 75%
**Recommended Model**: Opus
**Estimated Time**: 45-60 minutes (AI), 3-4 hours (human)
**Plan**:
1. Analyze bundle with `npm run build --analyze`
2. Focus on optimizing bundle with tree shaking
3. Configure manual chunks in Vite config for better caching
4. Accept larger initial bundle size (load everything at once)
5. No dynamic imports or lazy loading needed

## UI Ideas

### Mission Evaluation Table

**Task**: Create combat round visualization table
**Confidence**: 60% - Complex UI component
**Recommended Model**: Opus
**Estimated Time**: 60-90 minutes (AI), 6-8 hours (human)
**Plan**:
1. Create new MissionEvaluationTable component (supplement existing display)
2. Design table structure: columns = combat rounds, rows = units
3. Cell content: damage dealt/taken, termination events
4. Cell background gradient to show % of original effective skill
5. Store table data in state (similar to events storage pattern)
6. Static display without real-time animations
7. Add interactive tooltips for detailed information
8. No export functionality needed

## Priority Recommendations

### High Priority (Do First)

1. Outstanding KJA TODOs - Clean up technical debt
2. LeadsView implementation - Improves code quality
3. Testing domain model - Speeds up future development

### Medium Priority

1. Naming refactoring - Improves code clarity
2. Bundle size optimization - Improves user experience
3. Reference documentation - Helps future development

### Low Priority (Can Defer)

1. Mission evaluation table - Nice to have UI enhancement
2. Lead expiration - Feature addition, needs design decisions

## Overall Timeline Estimate

### Original Human Developer Estimates

- **Using Sonnet for most tasks**: 3-4 weeks
- **Using Opus for complex tasks**: 2-3 weeks
- **Mixed approach (recommended)**: 2.5 weeks

### Realistic AI-Assisted Estimates

- **Simple tasks (documentation, naming)**: 5-15 minutes each
- **Medium complexity (view patterns, refactoring)**: 30-60 minutes each
- **Complex tasks (state restructuring, testing framework)**: 1-3 hours each
- **Full backlog completion**: 2-3 days of active work (not continuous)

### Why the Difference?

- AI can write code at ~100x human speed
- No context switching or breaks needed
- Instant pattern recognition across codebase
- However, still need human review and decision-making between tasks

## Additional Questions

1. **Save Game Compatibility**: Should all changes maintain compatibility with existing save games?
2. **Testing Coverage**: What's your target test coverage percentage?
3. **Performance Targets**: What are acceptable load times and bundle sizes?
4. **Feature Freeze**: Are you planning to add new features during this refactoring?
5. **Deployment Strategy**: Should changes be released incrementally or as one major update?

## Next Steps

1. Review and answer clarification questions
2. Prioritize items based on your needs
3. Decide on model allocation (Opus vs Sonnet)
4. Begin with high-priority items
5. Create feature branches for major changes

## Implementation Order

### Phase 1: Foundation (High Priority)

1. **LeadsView** (20-30 min) - Clean domain model pattern
2. ✅ DONE **Document agent skill reduction** (5-10 min) - Quick documentation fix
3. ✅ DONE **Testing fixtures** (30-45 min) - Improves all future testing

### Phase 2: Core Refactoring (Medium Priority)  

1. ✅ DONE **Naming refactoring** (15-20 min) - update -> evaluate
2. **State hierarchy** (45-60 min) - Session/Situation/Assets structure
3. **MissionSitesView** (15-20 min) - Continue view pattern

### Phase 3: Features & Polish (Lower Priority)

1. **Lead expiration** (45-60 min) - New game mechanic
2. **Mission results storage** (30-45 min) - Better state management
3. **Mission evaluation table** (60-90 min) - Enhanced UI

### Phase 4: Optimization

1. **Performance middleware** (10-15 min) - Dev experience
2. **Bundle optimization** (45-60 min) - User experience
3. **Reference documentation** (10-15 min) - Future maintenance

---

*Note: All AI estimates assume familiarity with the codebase. Times shown are active work time, not including review cycles.*
