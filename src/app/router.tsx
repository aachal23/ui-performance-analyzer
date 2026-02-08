import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const Analyzer = lazy(() => import('@/pages/Analyzer').then((m) => ({ default: m.Analyzer })));
const Timeline = lazy(() => import('@/pages/Timeline').then((m) => ({ default: m.Timeline })));
const Network = lazy(() => import('@/pages/Network').then((m) => ({ default: m.NetworkWaterfall })));
const Suggestions = lazy(() => import('@/pages/Suggestions').then((m) => ({ default: m.Suggestions })));
const LayoutShiftHeatmap = lazy(() => import('@/pages/LayoutShift').then((m) => ({ default: m.LayoutShiftHeatmap })));
const Demo = lazy(() => import('@/pages/Demo').then((m) => ({ default: m.Demo })));

function PageFallback() {
  return (
    <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      Loading…
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<PageFallback />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/analyzer"
          element={
            <Suspense fallback={<PageFallback />}>
              <Analyzer />
            </Suspense>
          }
        />
        <Route
          path="/timeline"
          element={
            <Suspense fallback={<PageFallback />}>
              <Timeline />
            </Suspense>
          }
        />
        <Route
          path="/network"
          element={
            <Suspense fallback={<PageFallback />}>
              <Network />
            </Suspense>
          }
        />
        <Route
          path="/suggestions"
          element={
            <Suspense fallback={<PageFallback />}>
              <Suggestions />
            </Suspense>
          }
        />
        <Route
          path="/layout-shift"
          element={
            <Suspense fallback={<PageFallback />}>
              <LayoutShiftHeatmap />
            </Suspense>
          }
        />
        <Route
          path="/demo"
          element={
            <Suspense fallback={<PageFallback />}>
              <Demo />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
