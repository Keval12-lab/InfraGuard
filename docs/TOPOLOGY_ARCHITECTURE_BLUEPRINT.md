# Topology Architecture Blueprint (Sprint 4B - Revised)

This document establishes the official engineering blueprint for refactoring the `TopologyPage` module into a performance-optimized, modular enterprise layout engine.

---

## 1. Target Folder Structure

All topology modules will be organized in a self-contained feature directory `frontend/src/components/topology` to avoid global namespace clutter:

```
frontend/src/components/topology/
├── TopologyPage.jsx                # Root orchestrator page component
├── context/
│   └── TopologyContext.jsx         # Context provider for shared states (zoom, selectedNode, search)
├── components/
│   ├── TopologyCanvas.jsx          # SVG element container & transformer (Dumb component)
│   ├── TopologyToolbar.jsx         # Controls bar (Layout, Zoom, PNG Export)
│   ├── TopologySidebar.jsx         # Network directory sidebar list & stats
│   ├── Legend.jsx                  # Color & line indicators guide
│   ├── Node/
│   │   ├── DeviceNode.jsx          # Composite SVG Node
│   │   ├── NodeIcon.jsx            # Presentational vector icon
│   │   ├── NodeLabel.jsx           # Renders text details
│   │   ├── NodeStatus.jsx          # Ring color status indicator
│   │   └── NodeSelectionRing.jsx   # Selected focus indicator ring
│   └── Link/
│       ├── NetworkLink.jsx         # Composite SVG Link
│       ├── LinkPath.jsx            # Bezier line calculator
│       └── TrafficAnimation.jsx    # Packet flow animation path dot
├── hooks/
│   ├── useViewport.js              # Zoom & pan state & event handlers
│   ├── useTopologySelection.js     # Inspector selection & drawer state handlers
│   └── useTopologyInteraction.js   # Drag-and-drop & hover tooltip handlers
├── graph/
│   └── graphEngine.js              # Routing layer matching layout options
├── layout/
│   ├── hierarchicalLayout.js       # Tier-based level placement math (Current layoutEngine)
│   ├── radialLayout.js             # Future circular placement math
│   └── radialTreeLayout.js         # Future center-out hierarchical tree math
├── utils/
│   ├── svgHelpers.js               # XML serializing & canvas context operations
│   └── coordinateUtils.js          # Vector conversion math (SVG client bounds)
├── constants/
│   └── topologyConstants.js        # Coordinate offsets, colors, and constraints
├── tests/
│   └── topology.test.js            # Automated verification tests
└── types/
```

---

## 2. Refactoring Dependency Graph

To prevent import loops and limit depth to **$\le 3$**, imports must flow unidirectionally downwards:

```
[UI Routing Entry (App.jsx)]
          │
          ▼
   [TopologyPage] (Root orchestrator)
     └──► [TopologyContext] (Provides state context: no props drilling)
           ├──► [TopologySidebar] (Stat counts, search input, directory list)
           ├──► [TopologyToolbar] (Buttons: Refresh, Auto Layout, Reset, Export)
           ├──► [TopologyCanvas] (SVG viewport container)
           │      ├──► [DeviceNode] (Individual node elements)
           │      │      ├──► [NodeIcon], [NodeLabel]
           │      │      └──► [NodeStatus], [NodeSelectionRing]
           │      └──► [NetworkLink] (Cubic bezier lines & animations)
           │             ├──► [LinkPath]
           │             └──► [TrafficAnimation]
           ├──► [Legend] (Floating overlay)
           │
           %% Custom Hooks Layer
           ├──► [useViewport] (Zoom/pan offset matrices)
           ├──► [useTopologySelection] (Active node drawer/dialog context)
           └──► [useTopologyInteraction] (Dragging & tooltip states)
                  │
                  ▼
           %% Pure Math/Utility Layer (0 JSX, 0 react-state imports)
           ├──► [graphEngine] (Resolves active layout style)
           │      └──► [hierarchicalLayout] (Calculates coordinates)
           └──► [topologyConstants] (Level height config & styling color keys)
```

---

## 3. Module Responsibilities & API Specs

### A. Core Components

#### 1. `TopologyPage.jsx`

- **Purpose:** Orchestrates high-level layout, mounts the `TopologyProvider`, and handles loading templates.
- **Inputs:** None (routed page).
- **Outputs:** Context provider wrapper wrapping subcomponents.
- **Dependencies:** `TopologyProvider`, `TopologySidebar`, `TopologyToolbar`, `TopologyCanvas`, `Legend`.

#### 2. `TopologyCanvas.jsx`

- **Purpose:** Dumb renderer displaying the SVG container. Does not fetch data or use business logics.
- **Inputs:** Props from context (`nodes`, `links`, transform handlers).

#### 3. `DeviceNode.jsx`

- **Purpose:** Composite component rendering Node elements.
- **Structure:**
  - `NodeIcon`: Renders status vectors.
  - `NodeLabel`: Computes hostname strings.
  - `NodeStatus` & `NodeSelectionRing`: Renders active borders.

---

### B. Layout Engine & Routing

#### 1. `graph/graphEngine.js`

- **Purpose:** Decides which layout formula to run based on current configuration.
- **API:** `layout(devices, links, type = 'hierarchical') ➔ { nodes, links }`

#### 2. `layout/hierarchicalLayout.js`

- **Purpose:** Core vertical layout algorithm. Distributes WAN to endpoints horizontally along level heights.

---

## 4. Performance Optimization Strategy (Smooth 60fps dragging)

To keep gestures buttery smooth:

1.  **Pointer Events over Mouse Events:** Uses Pointer Events (`pointerdown`, `pointermove`, `pointerup`) to support touch screens and high-rate digitizers natively.
2.  **Passive Event Listeners:** Attaches move listeners with `{ passive: true }` so scrolling/zooming gestures do not block main-thread paint cycles.
3.  **3D Transforms:** Shifts layout translation calculations to hardware-accelerated CSS `transform: translate3d(x, y, 0) scale(z)` properties.
4.  **requestAnimationFrame (RAF):** Runs coordinates transformations on composite layers only during screen refreshes.
5.  **State Commitment Delay:** Commits coordinates to React state database via `requestIdleCallback` or microtasks **only** when the user releases the gesture (`pointerup`).
