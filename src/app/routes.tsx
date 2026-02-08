import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout/MainLayout';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Timeline } from '@/pages/Timeline/Timeline';
import { LayoutShiftHeatmap } from '@/pages/LayoutShift/LayoutShiftHeatmap';
import { NetworkWaterfall } from '@/pages/Network/NetworkWaterfall';
import { DeviceSimulation } from '@/pages/DeviceSimulation/DeviceSimulation';
import { Suggestions } from '@/pages/Suggestions/Suggestions';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/layout-shift" element={<LayoutShiftHeatmap />} />
        <Route path="/network" element={<NetworkWaterfall />} />
        <Route path="/simulation" element={<DeviceSimulation />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
