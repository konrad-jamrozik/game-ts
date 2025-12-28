---
name: AI Multi-Turn Delegation
overview: Implement a `delegateTurnsToAIPlayer` function that executes multiple AI turns in sequence, and add a Base UI Number Field with "Delegate N turns" button to the AI Player section UI.
todos:
  - id: delegate-turns-fn
    content: Implement delegateTurnsToAIPlayer function with loop and stop conditions
    status: pending
  - id: number-field-ui
    content: Add Base UI Number Field and Delegate N turns button to AIPlayerSection
    status: pending
  - id: verify
    content: Run qcheck to verify changes
    status: pending
    dependencies:
      - delegate-turns-fn
      - number-field-ui
---

# AI Multi-Turn Delegation Implementation

## Overview

Add the ability to delegate multiple turns to the AI player at once, with a number input field in the UI to specify how many turns.

## Key Files to Modify

- [`web/src/ai/delegateTurnToAIPlayer.ts`](web/src/ai/delegateTurnToAIPlayer.ts) - Add new `delegateTurnsToAIPlayer` function
- [`web/src/components/GameControls/AIPlayerSection.tsx`](web/src/components/GameControls/AIPlayerSection.tsx) - Add Number Field and multi-turn button

## Implementation Steps

### 1. Create `delegateTurnsToAIPlayer` function

Add a new function in [`delegateTurnToAIPlayer.ts`](web/src/ai/delegateTurnToAIPlayer.ts) that:

- Accepts `intellectName` and `turnCount` parameters
- Loops through the specified number of turns
- Stops early if game is over (`isGameOver` or `isGameWon`)
- Advances turn automatically between AI plays
```typescript
export function delegateTurnsToAIPlayer(intellectName: string, turnCount: number): void {
  for (let i = 0; i < turnCount; i++) {
    const currentState = store.getState().undoable.present.gameState
    if (isGameOver(currentState) || isGameWon(currentState)) {
      break
    }
    delegateTurnToAIPlayer(intellectName)
    const afterState = store.getState().undoable.present.gameState
    if (!isGameOver(afterState) && !isGameWon(afterState)) {
      store.dispatch(advanceTurn())
    }
  }
}
```




### 2. Update AIPlayerSection UI

Use the already-installed `@base-ui/react` package (v1.0.0):

```typescript
import { NumberField } from '@base-ui/react/number-field'
```

Component anatomy from Base UI docs:

```tsx
<NumberField.Root defaultValue={1} min={1}>
  <NumberField.Group>
    <NumberField.Decrement>-</NumberField.Decrement>
    <NumberField.Input />
    <NumberField.Increment>+</NumberField.Increment>
  </NumberField.Group>
</NumberField.Root>
```

Key props to use:

- `defaultValue={1}` - Start with 1 turn