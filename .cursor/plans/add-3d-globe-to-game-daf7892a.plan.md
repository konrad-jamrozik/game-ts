<!-- daf7892a-f903-43b7-9520-10a23256635e 1aa9a5bf-cb79-4916-9242-7b7bfd6b7484 -->
# Add 3D Globe to Game

## Library Selection

**Primary choice: `react-globe-gl`**

- Lightweight React wrapper around Three.js
- TypeScript support
- Good performance for web apps
- Easy to integrate with React/Redux
- Supports markers, arcs, and custom styling
- Active maintenance

**Alternative: Cesium** (mentioned in prompts.md)

- More powerful but heavier (~2MB+)
- Better for complex geospatial applications
- May be overkill for this use case

## Implementation Steps

### 1. Add Location Data to Models

**Files to modify:**

- `web/src/lib/model/model.ts`
- Add optional `location?: { lat: number; lng: number }` to `Mission` type
- Add optional `location?: { lat: number; lng: number }` to `Lead` type
- Add optional `location?: { lat: number; lng: number }` to `MissionSite` type

**Files to update:**

- `web/src/lib/collections/missions.ts` - Add sample coordinates for each mission
- `web/src/lib/collections/leads.ts` - Add sample coordinates for each lead

### 2. Install Dependencies

Add to `web/package.json`:

- `react-globe-gl`: Main globe library
- `three`: Peer dependency (may be required)

### 3. Create Globe Component

**New file: `web/src/components/Globe/Globe.tsx`**

- Create a React component that wraps `react-globe-gl`
- Accept props for missions and leads data
- Display markers for active missions and leads
- Handle marker clicks to select/interact with missions/leads
- Configure globe appearance (dark theme to match game aesthetic)
- Enable auto-rotation with controls to pause/resume

**New file: `web/src/components/Globe/Globe.types.ts`** (if needed)

- Type definitions for globe-specific data structures

### 4. Integrate Globe into App

**Modify: `web/src/app/App.tsx`**

- Import the Globe component
- Add Globe to the Grid layout (likely as a new Grid item)
- Pass missions and leads data from Redux store to Globe
- Handle selection events from Globe to update game state

### 5. Add Globe Styling

**Modify: `web/src/styling/theme.tsx`** (if needed)

- Add any globe-specific theme configurations

**Or create: `web/src/components/Globe/Globe.styles.ts`**

- Component-specific styling for the globe container

### 6. Add Interaction Logic

**Modify: `web/src/components/Globe/Globe.tsx`**

- Connect to Redux store to read missions/leads
- Handle marker clicks to dispatch actions (e.g., select mission/lead)
- Show different marker styles for different states (Active, Deployed, etc.)
- Optionally show arcs/lines connecting related missions/leads

### 7. Testing Considerations

- Verify globe renders correctly
- Test marker display for missions and leads
- Test interaction handlers
- Ensure performance is acceptable with multiple markers
- Test responsive behavior

## Technical Considerations

- **Performance**: `react-globe-gl` uses WebGL, ensure browser compatibility
- **Bundle size**: Monitor impact on build size (react-globe-gl is relatively small)
- **Accessibility**: Add ARIA labels and keyboard navigation support
- **Mobile**: Consider touch controls for rotation/zoom on mobile devices
- **Default locations**: Assign realistic geographic coordinates to missions/leads (can be fictional locations)

## Future Enhancements (Out of Scope)

- Animate marker appearance/disappearance
- Show mission deployment paths as arcs
- Heat maps for faction activity
- Time-based visualization of mission history

### To-dos

- [ ] Add location data (lat/lng) to Mission, Lead, and MissionSite types in model.ts
- [ ] Add sample coordinates to missions and leads collections
- [ ] Install react-globe-gl and three dependencies
- [ ] Create Globe.tsx component with react-globe-gl integration
- [ ] Style globe component to match game theme (dark mode)
- [ ] Connect Globe component to Redux store to read missions/leads
- [ ] Implement marker click handlers and selection logic
- [ ] Add Globe component to App.tsx layout