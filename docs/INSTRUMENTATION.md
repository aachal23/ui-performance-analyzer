# Demo App Instrumentation Layer

## Web Vitals and the Analyzer store

- **useWebVitals** is used only inside **InstrumentationCollector** (on the /demo route). It captures LCP, FCP, CLS, INP, TTFB for the Demo App session.
- A **singleton forwarder** ensures the web-vitals library is registered only once app-wide; the active hook instance sets itself as the handler. On unmount the handler is cleared, so reports stop being processed and duplicate observers are avoided.
- Metrics are **normalized** (WebVitalMetric with name, value, rating, etc.) and pushed into **InstrumentationContext.snapshot.webVitals** (the Analyzer store) only while `isRecording` is true.
- The **Analyzer** page reads from `useInstrumentation().snapshot.webVitals` and displays them via WebVitalsDashboard. It does not run useWebVitals itself.

## Performance Timeline and session start

- **usePerformanceTimeline(sessionStartTime)** runs only inside InstrumentationCollector (on /demo). It observes paint, resource, navigation, and layout-shift during DemoApp render.
- **Session start**: When the user clicks Start, `sessionStartTime = performance.now()` is stored in context. Timeline entries are normalized so that `startTime` is relative to session start (0 = when Start was clicked). Entries with `startTime < sessionStartTime` are excluded. Model `timeOrigin` is 0 when normalized.
- The normalized **TimelineModel** (entries, timeOrigin, endTime) is pushed to **snapshot.timeline** and the **Timeline** page reads it and renders TimelineChart. The Timeline page does not run usePerformanceTimeline itself.

## How isolation is handled

### 1. **Lifecycle isolation (PerformanceObserver only when Demo is mounted)**

- **InstrumentationCollector** is rendered only on the **/demo** route. It runs the performance hooks (`useWebVitals`, `usePerformanceTimeline`, `useNetworkMetrics`, `useLayoutShift`), which in turn register PerformanceObservers (and web-vitals callbacks).
- When the user is **not** on /demo, InstrumentationCollector is not in the tree, so those hooks are not mounted and **no observers run**. The Analyzer UI (other routes) is never measured by this layer.
- When the user **navigates to /demo**, InstrumentationCollector mounts, the hooks run, and observers start. All measurement is then scoped to the Demo App page (and any navigation that happens while still under the demo route).

So: **observers are attached only to the Demo App lifecycle** — they exist only while the Demo route is mounted.

### 2. **Temporal isolation (Start / Stop recording)**

- **Start** clears the stored snapshot and sets `isRecording = true`. The collector only writes into the context snapshot when `isRecording` is true.
- **Stop** sets `isRecording = false`. The collector stops updating the snapshot; the last state is kept as the “frozen” result.
- So only the period between Start and Stop is reflected in the snapshot. Metrics from before Start or after Stop are not merged in.

### 3. **Reset between runs**

- **Reset** clears the snapshot (via `getEmptySnapshot()`) and sets `isRecording = false`. Each new run starts from an empty snapshot after Start.

### 4. **Separation from Analyzer UI**

- The **Analyzer** (e.g. /analyzer, /timeline, /network) uses its own hooks when you are on those pages, for “live” inspection of the current tab.
- The **instrumentation snapshot** is stored in React context and is updated only by the collector on /demo when recording. So the Demo App instrumentation is isolated from the Analyzer UI both by **route** (collector only on /demo) and by **recording state** (only when Start has been pressed).

### 5. **Layout Shift scoped to Demo App container**

- **useLayoutShift** accepts an optional `containerRef`. When provided (on the Demo page), only layout-shift **sources** whose affected node is inside that container are kept; entries with no such sources are dropped. This scopes CLS capture to the Demo App viewport only.
- Stored rects are always in **viewport coordinates** (from the Layout Shift API). The **Layout Shift overlay** is rendered inside the Demo App container. When **containerRect** is passed (from `useContainerRect(containerRef)`), viewport rects are converted to **container-relative** coordinates: `relX = viewportRect.x - containerRect.x`, `relY = viewportRect.y - containerRect.y`. The overlay is a child of the container with `position: absolute; inset: 0`; boxes use `(relX, relY)` so they align with the Demo App content. The container has `position: relative`. A toolbar **Overlay** toggle on the Demo page enables or disables the overlay. The **Layout Shift** Analyzer page shows the same CLS data from the snapshot and a **Clear** action that clears only layout-shift entries in the snapshot.

### 6. **Network Waterfall scoped to Demo App session**

- **useNetworkMetrics** captures all resource timing entries (PerformanceObserver + initial getEntriesByType). Raw entries include full **url** so the collector can filter.
- **InstrumentationCollector** builds a session-scoped network: only entries with `startTime >= sessionStartTime` and **same-origin** are kept; **startTime** is normalized to session-relative (0 = session start); **endTime** is max(normalized start + duration). The **Network** Analyzer page reads `snapshot.network` and **Clear** clears only network in the snapshot.

### 7. **Analyzer Session Management**

- **Start** generates a new `sessionId`, sets `sessionStartedAt` and `sessionStartTime`, clears the snapshot, and sets `isRecording = true`. **Observer duplication** is prevented: `startRecording` is a no-op if already recording.
- **Stop** sets `sessionStoppedAt`, sets `isRecording = false`, and appends a **run record** to **runsHistory** (sessionId, startedAt, stoppedAt, summary). **Reset** clears the snapshot and session; runs history is kept until **Clear history**. **AnalyzerSessionManager** provides UI: mode `full` (Demo) for Start/Stop/Reset; mode `summary` (Analyzer) for session id, timestamps, runs history, Reset and Clear history.

## Flow

1. User opens **Demo App** (/demo).
2. User clicks **Start** → snapshot cleared, `isRecording = true`, collector (already mounted on /demo) starts pushing metrics into context.
3. User interacts with the heavy Demo UI (images, list, animations).
4. User clicks **Stop** → `isRecording = false`, snapshot no longer updated; it holds the last recording.
5. User clicks **View results** → navigates to /analyzer (snapshot remains in context for future use).
6. User can click **Reset** (e.g. back on /demo) to clear the snapshot before the next run.
