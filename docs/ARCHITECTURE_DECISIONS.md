# InfraGuard Architecture Decision Records (ADRs)

This document registers the design and architectural decisions made for the InfraGuard platform.

---

## ADR-001: Selection of React Query (TanStack Query) for Network State

### Context

InfraGuard requires real-time network discovery, SNMP status updates, and dynamic device telemetry. Frequent updates can lead to race conditions, excessive endpoint polling, and complex cache invalidation.

### Decision

Use TanStack Query (`useQuery`) to manage all remote asset databases and topology state.

### Rationale

- **Automatic Cache Synchronization:** Out-of-the-box caching, background polling, and refetch-on-window-focus features.
- **Decoupled State:** Stores endpoint state globally, removing custom state machines or Redux setups.
- **Consistent Loading/Refetch Indicators:** Direct hooks for `isLoading` and `isRefetching` simplify UI state loading bars.

---

## ADR-002: SVG Viewport Rendering vs. HTML5 Canvas/WebGL

### Context

The Topology engine draws up to several hundred devices with dynamic interconnections, packet-flow animations, search highlights, and drag-and-drop triggers.

### Decision

Use scalable SVG elements combined with CSS 3D transforms for rendering the initial topology view, while maintaining an interface pattern that permits drop-in replacement with Canvas or WebGL renderers in the future.

### Rationale

- **Declarative DOM Nodes:** Simple event listeners (`onClick`, `onMouseDown`) bind directly to SVG nodes without coordinate-to-device mapping logic.
- **Vector Fidelity:** SVG scales without pixelation during deep zoom gestures.
- **Animation Paths:** Native SVG `<animateMotion>` lets packets follow Cubic Bezier paths with zero CPU math.
- **Scale Limitation Mitigation:** For networks exceeding 1,000 nodes, SVG performance can degrade. The refactored structure isolates rendering to `TopologyCanvas` and dumb child components, allowing future developers to switch to WebGL without modifying business hooks or the layout engines.

---

## ADR-003: Tiered Hierarchical Layout Engine

### Context

Discovered networks must be represented in a structured, readable manner to let operators trace WAN endpoints down to core switches and endpoints.

### Decision

Implement a rigid 4-tier Level layout (WAN Level 0 ➔ Routers Level 1 ➔ Switches Level 2 ➔ Endpoints Level 3) with dynamic horizontal grid positioning.

### Rationale

- **Instant Comprehension:** Emulates standard physical network topology trees.
- **Predictable Positioning:** Avoids force-directed jitter, keeping nodes readable.
- **Low CPU Footprint:** Coordinate mapping completes in $\mathcal{O}(N)$ time, avoiding performance bottlenecks on low-power devices.

---

## ADR-004: Decoupled Render Transforms via requestAnimationFrame (RAF)

### Context

During zoom, pan, or node-drag gestures, updating React state on every frame (60 times/second) forces complete virtual DOM tree reconciliations, causing visible frame drops.

### Decision

Perform real-time translation updates directly on DOM nodes via CSS `transform3d` matrices triggered within `requestAnimationFrame` (RAF) and Pointer Events listeners, postponing React state updates (`nodePositions`) until the drag ends (`pointerup`/`mouseup`).

### Rationale

- **60fps Butter Performance:** Offloads layout translation calculations from the React render cycles directly to Chrome's compositor engine.
- **Single Reconciliation:** React state is updated exactly once at the end of the gesture, triggering a single visual commit instead of hundreds of micro-renders.
