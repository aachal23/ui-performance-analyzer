/**
 * Device and network simulation / throttling.
 */

export interface NetworkThrottle {
  download: number; // Kbps
  upload: number;  // Kbps
  rtt: number;     // ms
}

export interface ThrottlePreset {
  id: string;
  label: string;
  network: NetworkThrottle;
  cpu?: number; // slowdown factor (e.g. 4 = 4x slower)
}

export interface SimulationState {
  presetId: string | null;
  network: NetworkThrottle;
  cpuSlowdown: number;
  active: boolean;
}

/** Demo stress toggles: each enables a simulation that affects performance metrics. */
export interface DemoStressOptions {
  largeImages: boolean;
  extraApiDelay: boolean;
  heavyRerenders: boolean;
  animations: boolean;
}

export const DEFAULT_DEMO_STRESS_OPTIONS: DemoStressOptions = {
  largeImages: false,
  extraApiDelay: false,
  heavyRerenders: false,
  animations: true,
};
