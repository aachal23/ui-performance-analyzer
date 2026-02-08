# Demo Stress Controls & Metric Impact

The Demo page includes **Stress controls** that let you simulate heavier load and observe the impact on collected metrics live (Web Vitals, timeline, network, layout shift).

## Controls

| Toggle | What it does | Primary metric impact |
|--------|----------------|------------------------|
| **Large images** | Uses more (12) and larger (1200×800) images from Picsum. | **LCP, FCP** – larger bytes and decode; **Network** – more/larger requests. |
| **Extra API delay** | Renders a “Delayed API” block that resolves after 2.5s (simulated slow server). | **TTFB** – simulates slow first byte; can delay **LCP** if content is gated on this. |
| **Heavy re-renders** | A ticker component updates state every 50ms, forcing frequent React re-renders. | **INP** – main thread stays busy; **Timeline** – more paint/layout activity. |
| **Animations** | Enables or disables the infinite scale/rotate animation section (Framer Motion). | **CLS** (if layout changes); **Timeline** – continuous paint/composite; main thread. |

## How to use

1. Open **Demo App** (`/demo`).
2. Use **Stress controls** above the content to turn simulations on/off.
3. Click **Start** to begin recording.
4. Interact with the page (scroll, toggle list, let images load, wait for delayed API).
5. Click **Stop**, then **View results** to see Web Vitals, Timeline, Network, Layout Shift, and Suggestions.

Changes to stress options take effect immediately; the next recording will reflect the current toggles. You can compare runs with different combinations (e.g. large images on vs off) to see how each stress affects metrics.
