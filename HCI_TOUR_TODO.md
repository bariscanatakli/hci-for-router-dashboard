# HCI Tour - Issues & TODOs

## Critical Issues

### 1. Interaction Blocking
The tour overlay blocks all user interaction with highlighted elements. Users cannot:
- Click buttons
- Hover for tooltips
- Interact with forms
- Toggle switches

**Solution**: Add `pointer-events: none` to overlay but `pointer-events: auto` to highlighted area cutout. Allow interaction pass-through for demo purposes.

### 2. Highlight Positioning Issues
Multiple slides have incorrect or missing highlight positions:
- **Slide 2**: Points to wrong area (not nav labels)
- **Slide 15**: No highlighted area
- **Slide 16**: No highlighted area (Expert mode issue)
- **Slide 18**: No highlighted area
- **Slide 20**: Wrong position (same as slide 2)
- **Slide 21**: Same wrong position
- **Slide 25**: Can't see full content, only highlight
- **Slide 27**: Navbar items not visible

**Solution**: Review and fix all `selector` values. Ensure elements exist and are visible.

### 3. Tour Modal Collision with Highlighted Area
Tour card overlaps with highlighted elements on many slides:
- **Slide 14**: Modal covers the button
- **Slide 19**: Buttons not visible
- **Slide 22**: Modal on top of highlighted area

**Solution**: Implement dynamic positioning that:
1. Detects collision between bubble and highlight
2. Moves bubble to opposite side or corner
3. Ensures both are fully visible

### 4. Missing UI Elements
- **Slide 9**: Network status badge removed - needs to be restored in Topbar

### 5. Session Persistence
- **Slide 23**: Refreshing page loses tour progress
- User had to click Next 23 times to return to slide 24

**Solution**: Persist `globalIndex` to localStorage/sessionStorage

### 6. Manual Step Selection
- **Slide 24**: User requested ability to jump to any slide manually

**Solution**: Add slide picker/dropdown or clickable progress indicator

### 7. Hover Effects Not Working
- **Slide 11**: No hover effect on charts
- **Slide 26**: Hover not working
- **Slide 28**: Info badge hover tooltips not working

**Solution**: Allow pointer events in highlight area for hover states

---

## Implementation Plan

### Phase 1: Fix Interaction (Priority: HIGH)
- [ ] Modify overlay to allow pointer events in cutout area
- [ ] Add interaction mode toggle (view-only vs interactive demo)
- [ ] Ensure tooltips work on hover

### Phase 2: Fix Highlight Positions (Priority: HIGH)
- [ ] Audit all 29 slides and verify selectors exist
- [ ] Fix slide 2, 15, 16, 18, 20, 21, 25, 27 selectors
- [ ] Add fallback positioning when element not found

### Phase 3: Dynamic Bubble Positioning (Priority: HIGH)
- [ ] Detect bubble-highlight collision
- [ ] Implement 8-direction positioning (top, bottom, left, right, corners)
- [ ] Add minimum spacing between bubble and highlight
- [ ] Handle edge cases (element at screen edge)

### Phase 4: Restore Network Badge (Priority: MEDIUM)
- [ ] Add network status badge back to Topbar (right end)
- [ ] Update slide 9 selector

### Phase 5: Session Persistence (Priority: MEDIUM)
- [ ] Save current step to sessionStorage
- [ ] Restore step on page refresh
- [ ] Clear on tour complete

### Phase 6: Manual Navigation (Priority: LOW)
- [ ] Add step selector dropdown
- [ ] Make progress dots clickable
- [ ] Add keyboard shortcuts (number keys?)

---

## Slide-by-Slide Fixes

| Slide | Issue | Selector Fix | Notes |
|-------|-------|--------------|-------|
| 2 | Wrong highlight | `[data-tour="sidebar-links"]` | Check if exists |
| 5 | No interaction | Allow pointer events | Cmd+K demo |
| 7 | No interaction | Allow pointer events | Mode toggle |
| 8 | No interaction | Allow pointer events | Mode toggle |
| 9 | Missing element | Restore network badge | Topbar right |
| 10 | No interaction | Allow pointer events | - |
| 11 | No hover | Allow pointer events | Chart hover |
| 12 | No click | Allow pointer events | - |
| 13 | No click | Allow pointer events | - |
| 14 | Collision | Dynamic position | Move bubble |
| 15 | No highlight | Fix selector | - |
| 16 | No highlight | Fix selector + Expert | Port forward |
| 17 | No click | Allow pointer events | Reboot |
| 18 | No highlight | Fix selector | - |
| 19 | Collision | Dynamic position | Move bubble |
| 20 | Wrong position | Fix selector | Nav labels |
| 21 | Wrong position | Fix selector | Nav labels |
| 22 | Collision | Dynamic position | Move bubble |
| 23 | Lost progress | Session persist | F5 issue |
| 25 | Limited view | Expand highlight? | Device list |
| 26 | No hover | Allow pointer events | - |
| 27 | Wrong position | Fix selector | Nav items |
| 28 | No hover | Allow pointer events | Info badges |

---

## Technical Notes

### Pointer Events Strategy
```tsx
// Overlay: blocks everything except cutout
<div className="pointer-events-auto">
  <svg>
    {/* Dark overlay with cutout mask */}
  </svg>
</div>

// Cutout area: allow interaction
<div 
  className="pointer-events-auto"
  style={{
    position: 'fixed',
    top: highlightRect.top,
    left: highlightRect.left,
    width: highlightRect.width,
    height: highlightRect.height,
  }}
/>
```

### Collision Detection
```tsx
function detectCollision(bubble: DOMRect, highlight: DOMRect): boolean {
  return !(
    bubble.right < highlight.left ||
    bubble.left > highlight.right ||
    bubble.bottom < highlight.top ||
    bubble.top > highlight.bottom
  );
}
```

### Session Storage
```tsx
useEffect(() => {
  sessionStorage.setItem('hci-tour-step', String(globalIndex));
}, [globalIndex]);

// On mount
const savedStep = sessionStorage.getItem('hci-tour-step');
if (savedStep) setGlobalIndex(Number(savedStep));
```
