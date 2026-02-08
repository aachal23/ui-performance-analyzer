# UI Performance Analyzer — Architecture & Proposal

A production-ready proposal for a web tool that visually analyzes UI performance using browser Performance APIs.

---

## 1. Folder Structure

```
my-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/                      # App shell & routing
│   │   ├── App.tsx
│   │   ├── App.module.css
│   │   ├── routes.tsx
│   │   └── providers.tsx
│   │
│   ├── pages/                    # Route-level pages
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Dashboard.module.css
│   │   │   └── index.ts
│   │   ├── Timeline/
│   │   │   ├── Timeline.tsx
│   │   │   ├── Timeline.module.css
│   │   │   └── index.ts
│   │   ├── LayoutShift/
│   │   │   ├── LayoutShiftHeatmap.tsx
│   │   │   ├── LayoutShiftHeatmap.module.css
│   │   │   └── index.ts
│   │   ├── Network/
│   │   │   ├── NetworkWaterfall.tsx
│   │   │   ├── NetworkWaterfall.module.css
│   │   │   └── index.ts
│   │   ├── DeviceSimulation/
│   │   │   ├── DeviceSimulation.tsx
│   │   │   ├── DeviceSimulation.module.css
│   │   │   └── index.ts
│   │   └── Suggestions/
│   │       ├── Suggestions.tsx
│   │       ├── Suggestions.module.css
│   │       └── index.ts
│   │
│   ├── components/               # Reusable UI
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── MainLayout/
│   │   │   └── Card/
│   │   ├── charts/               # Recharts wrappers
│   │   │   ├── WebVitalsGauge/
│   │   │   ├── PerformanceTimelineChart/
│   │   │   └── WaterfallBar/
│   │   ├── performance/          # Performance-specific UI
│   │   │   ├── MetricCard/
│   │   │   ├── LayoutShiftOverlay/
│   │   │   └── NetworkRow/
│   │   ├── simulation/
│   │   │   ├── ThrottleSlider/
│   │   │   └── DevicePresetSelector/
│   │   └── ui/                   # Primitives
│   │       ├── Button/
│   │       ├── Badge/
│   │       ├── Skeleton/
│   │       └── SkipLink/
│   │
│   ├── features/                 # Feature modules (hooks + logic)
│   │   ├── webVitals/
│   │   │   ├── useWebVitals.ts
│   │   │   ├── webVitalsCollector.ts
│   │   │   └── constants.ts
│   │   ├── performanceTimeline/
│   │   │   ├── usePerformanceTimeline.ts
│   │   │   └── timelineUtils.ts
│   │   ├── layoutShift/
│   │   │   ├── useLayoutShift.ts
│   │   │   └── clsCalculator.ts
│   │   ├── network/
│   │   │   ├── useResourceTiming.ts
│   │   │   └── resourceTimingUtils.ts
│   │   ├── deviceSimulation/
│   │   │   ├── useDeviceSimulation.ts
│   │   │   └── throttlePresets.ts
│   │   └── suggestions/
│   │       ├── useSuggestions.ts
│   │       ├── suggestionRules.ts
│   │       └── types.ts
│   │
│   ├── store/                    # Global state (e.g. Zustand or context)
│   │   ├── performanceStore.ts
│   │   ├── simulationStore.ts
│   │   └── types.ts
│   │
│   ├── types/                    # Shared TypeScript types & models
│   │   ├── webVitals.ts
│   │   ├── performance.ts
│   │   ├── network.ts
│   │   ├── layoutShift.ts
│   │   ├── simulation.ts
│   │   └── index.ts
│   │
│   ├── lib/                      # Utilities & API wrappers
│   │   ├── performanceApi.ts
│   │   ├── polyfills.ts
│   │   └── constants.ts
│   │
│   ├── styles/                   # Global & theme
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── reset.css
│   │
│   ├── hooks/                    # Generic shared hooks
│   │   ├── useMediaQuery.ts
│   │   ├── usePrefersReducedMotion.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── docs/
│   └── ARCHITECTURE.md
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 2. Core Pages and Components

### Pages (one per major feature)

| Page | Route | Responsibility |
|------|--------|----------------|
| **Dashboard** | `/` | Web Vitals overview (LCP, FCP, CLS, INP, TTFB), summary cards, quick links to other views |
| **Timeline** | `/timeline` | Visual performance timeline (marks, measures, long tasks) using Recharts |
| **Layout Shift** | `/layout-shift` | CLS heatmap overlay and list of shift entries with scores |
| **Network** | `/network` | Waterfall view of resource timing (fetch/XHR, scripts, styles, etc.) |
| **Device Simulation** | `/simulation` | Slow network/CPU throttling controls and presets |
| **Suggestions** | `/suggestions` | Rule-based suggestions engine output with priority and actions |

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **MainLayout** | `components/layout/MainLayout` | App shell: sidebar nav, header, main content, skip link |
| **Header** | `components/layout/Header` | Title, live/recording indicator, device simulation badge |
| **Sidebar** | `components/layout/Sidebar` | Nav links with active state, accessible menu |
| **MetricCard** | `components/performance/MetricCard` | Single Web Vital display (value, status, trend) with Framer Motion |
| **WebVitalsGauge** | `components/charts/WebVitalsGauge` | Recharts radial/bar gauge for LCP/FCP/CLS/INP/TTFB |
| **PerformanceTimelineChart** | `components/charts/PerformanceTimelineChart` | Recharts-based timeline of performance entries |
| **LayoutShiftOverlay** | `components/performance/LayoutShiftOverlay` | Visual overlay of layout shift regions (heatmap) |
| **NetworkRow** | `components/performance/NetworkRow` | Single row in waterfall (name, duration, timing breakdown) |
| **WaterfallBar** | `components/charts/WaterfallBar` | Horizontal bar for one resource in waterfall |
| **ThrottleSlider** | `components/simulation/ThrottleSlider` | Network/CPU throttle controls |
| **DevicePresetSelector** | `components/simulation/DevicePresetSelector` | Presets: Fast 3G, Slow 3G, Offline, CPU 4x slowdown |
| **SkipLink** | `components/ui/SkipLink` | “Skip to main content” for accessibility |
| **Card, Button, Badge, Skeleton** | `components/ui/` | Shared primitives |

---

## 3. Data Models and Types

### Web Vitals (`types/webVitals.ts`)

```ts
export type WebVitalName = 'LCP' | 'FCP' | 'CLS' | 'INP' | 'TTFB';

export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export interface WebVitalsSnapshot {
  LCP: number | null;
  FCP: number | null;
  CLS: number | null;
  INP: number | null;
  TTFB: number | null;
  timestamp: number;
}
```

### Performance Timeline (`types/performance.ts`)

```ts
export interface PerformanceMarkMeasure {
  name: string;
  startTime: number;
  duration: number;
  entryType: 'mark' | 'measure' | 'longtask';
}
```

### Layout Shift (`types/layoutShift.ts`)

```ts
export interface LayoutShiftEntry {
  value: number;
  hadRecentInput: boolean;
  sources: Array<{ node?: string; currentRect: DOMRectReadOnly; previousRect: DOMRectReadOnly }>;
}
```

### Network (`types/network.ts`)

```ts
export interface ResourceTimingEntry {
  name: string;
  startTime: number;
  duration: number;
  initiatorType: string;
  transferSize?: number;
  encodedBodySize?: number;
}
```

### Simulation (`types/simulation.ts`)

```ts
export interface ThrottlePreset {
  id: string;
  label: string;
  network: { download: number; upload: number; rtt: number };
  cpu?: number; // slowdown factor
}
```

### Suggestions (`types/suggestions.ts`)

```ts
export interface Suggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  metric: WebVitalName;
  action?: string;
}
```

---

## 4. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Feature-based modules under `features/`** | Colocate hooks and domain logic (Web Vitals, timeline, CLS, network, simulation, suggestions) for clear ownership and testability. |
| **CSS Modules** | Scoped styles, no global clashes, good with TypeScript and tree-shaking. Use `variables.css` for design tokens. |
| **Recharts** | React-first, composable, accessible-friendly with proper `aria-*` and roles. Use for gauges, timeline, and waterfall bars. |
| **Framer Motion** | Page transitions and metric card animations; respect `prefers-reduced-motion` via a shared hook. |
| **Single store (Zustand recommended)** | One store for performance snapshot + simulation state; keeps Dashboard and child pages in sync without prop drilling. |
| **Web Vitals via `web-vitals` lib** | Small, standards-aligned; use for LCP, FCP, CLS, INP. TTFB from `PerformanceNavigationTiming`. |
| **PerformanceObserver + Resource Timing** | Timeline and network waterfall from native APIs; no extra runtime beyond the app. |
| **Device simulation** | Use Chrome DevTools Protocol (CDP) where available (e.g. Playwright for demos), or document manual throttling; optional integration with `navigator.connection` and CPU throttling hints. |
| **Suggestions engine** | Rule-based: thresholds from Web Vitals (e.g. LCP &lt; 2.5s = good) and heuristics (e.g. many large images → suggest lazy loading). Pure functions for easy testing. |
| **Accessibility** | Semantic HTML, skip link, ARIA on charts, keyboard nav, focus management, and `usePrefersReducedMotion` to tone down or disable animations. |

---

## 5. Initial Setup Steps (React + TypeScript)

### Step 1: Create Vite + React + TypeScript project

```bash
npm create vite@latest . -- --template react-ts
```

### Step 2: Install dependencies

```bash
npm install recharts framer-motion zustand web-vitals
npm install -D @types/node
```

### Step 3: Add folder structure

Create the directories under `src/` as in the folder structure above (e.g. `app/`, `pages/`, `components/`, `features/`, `store/`, `types/`, `lib/`, `styles/`, `hooks/`).

### Step 4: Configure path aliases (optional)

In `vite.config.ts` and `tsconfig.json`, add alias `@` → `src` so imports are like `@/components/...` and `@/types/...`.

### Step 5: Global styles and CSS variables

- Add `styles/variables.css` (colors, spacing, typography).
- Add `styles/globals.css` (import variables, base font, focus outlines).
- Import `globals.css` in `main.tsx`.

### Step 6: Define types

- Add `types/webVitals.ts`, `types/performance.ts`, `types/network.ts`, `types/layoutShift.ts`, `types/simulation.ts`, `types/suggestions.ts`.
- Add `types/index.ts` that re-exports all.

### Step 7: App shell and routing

- Install React Router: `npm install react-router-dom`.
- Create `app/providers.tsx` (Router, theme/motion prefs if needed).
- Create `app/routes.tsx` with routes for Dashboard, Timeline, LayoutShift, Network, DeviceSimulation, Suggestions.
- Wire routes in `App.tsx` and add `MainLayout` with `Sidebar` and `Header`.

### Step 8: First feature: Web Vitals

- Implement `features/webVitals/useWebVitals.ts` (subscribe to `web-vitals` and optionally TTFB from `performance.getEntriesByType('navigation')`).
- Implement `performanceStore` (Zustand) to hold latest snapshot.
- Build `MetricCard` and a simple Recharts gauge in `WebVitalsGauge`.
- Dashboard page: read from store and render metric cards + gauges.

### Step 9: Accessibility baseline

- Add `SkipLink` and ensure it’s first focusable element.
- Use `usePrefersReducedMotion` and pass to Framer Motion `useReducedMotion`.
- Add `lang` and descriptive page titles; ensure chart elements have `role="img"` and `aria-label`.

### Step 10: Polish and production checks

- Add `.env.example` for any public env vars.
- Ensure build passes: `npm run build`.
- Run Lighthouse (performance + accessibility) on the built app.

---

This document is the single source of truth for the UI Performance Analyzer structure, pages, components, data models, and setup. Implement features in the order above for a clean, production-friendly foundation.
