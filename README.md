# UI Performance Analyzer for Web Apps

A web tool that visually analyzes UI performance using browser Performance APIs.

## Tech stack

- **React** + **TypeScript**
- **CSS Modules** for styling
- **Recharts** for gauges and timelines
- **Framer Motion** for animations
- **Zustand** for state
- **web-vitals** for Core Web Vitals (LCP, FCP, CLS, INP)
- **React Router** for navigation

## Features

- Web Vitals dashboard (LCP, FCP, CLS, INP, TTFB)
- Visual performance timeline
- Layout shift heatmap
- Network waterfall view
- Device simulation (slow network / CPU)
- Suggestions engine
- Clean modern UI with animations
- Accessibility support (skip link, reduced motion, semantic HTML)

## Project structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for:

- Folder structure
- Core pages and components
- Data models and types
- Architecture decisions
- Step-by-step implementation guide

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Implementation order

1. **Dashboard** — Wire `useWebVitals` and performance store; add MetricCard and WebVitalsGauge.
2. **Timeline** — `usePerformanceTimeline` + Recharts timeline.
3. **Layout Shift** — CLS observer + heatmap overlay.
4. **Network** — Resource Timing API + waterfall chart.
5. **Device Simulation** — Throttle presets and UI (note: real throttling may require CDP or manual DevTools).
6. **Suggestions** — Rule engine from Web Vitals thresholds and heuristics.

## Scripts

| Command   | Description        |
|----------|--------------------|
| `npm run dev`     | Start Vite dev server |
| `npm run build`   | TypeScript check + Vite build |
| `npm run preview` | Serve `dist` locally |
| `npm run lint`    | Run ESLint (when configured) |

## License

MIT
