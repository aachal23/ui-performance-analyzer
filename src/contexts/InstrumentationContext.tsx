import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { InstrumentationSnapshot, RunRecord } from '@/types/instrumentation';
import {
  getEmptySnapshot,
  generateSessionId,
  getRunSummary,
} from '@/types/instrumentation';

type SnapshotUpdate = Partial<InstrumentationSnapshot>;

interface InstrumentationContextValue {
  snapshot: InstrumentationSnapshot;
  isRecording: boolean;
  /** High-resolution time when Start was clicked (performance.now()); used to normalize timeline. */
  sessionStartTime: number | null;
  /** Current session id (set on Start, kept until Reset). */
  sessionId: string | null;
  /** Unix ms when recording was started (Date.now()). */
  sessionStartedAt: number | null;
  /** Unix ms when recording was stopped (Date.now()). */
  sessionStoppedAt: number | null;
  /** History of completed runs (newest first). */
  runsHistory: RunRecord[];
  startRecording: () => void;
  stopRecording: () => void;
  reset: () => void;
  /** Clear runs history only (keeps current snapshot). */
  clearHistory: () => void;
  /** Called by InstrumentationCollector only when isRecording; merges into snapshot. */
  updateSnapshot: (update: SnapshotUpdate) => void;
}

const InstrumentationContext = createContext<InstrumentationContextValue | null>(null);

interface InstrumentationProviderProps {
  children: ReactNode;
}

/**
 * InstrumentationProvider holds recording state and the frozen snapshot.
 * This is the Analyzer store: Web Vitals (and timeline, network, layout shift) are
 * normalized and stored here by InstrumentationCollector during a Demo App session.
 * Only updates snapshot when isRecording is true (via updateSnapshot from the collector).
 */
const MAX_RUNS_HISTORY = 50;

export function InstrumentationProvider({ children }: Readonly<InstrumentationProviderProps>) {
  const [snapshot, setSnapshot] = useState<InstrumentationSnapshot>(getEmptySnapshot);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [sessionStoppedAt, setSessionStoppedAt] = useState<number | null>(null);
  const [runsHistory, setRunsHistory] = useState<RunRecord[]>([]);

  const startRecording = useCallback(() => {
    if (isRecording) return;
    const id = generateSessionId();
    setSessionId(id);
    setSessionStartedAt(Date.now());
    setSessionStoppedAt(null);
    setSnapshot(getEmptySnapshot());
    setSessionStartTime(typeof performance !== 'undefined' ? performance.now() : null);
    setIsRecording(true);
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (isRecording) {
      const stoppedAt = Date.now();
      setSessionStoppedAt(stoppedAt);
      setIsRecording(false);
      setRunsHistory((prev) => {
        const startedAt = sessionStartedAt ?? stoppedAt;
        const record: RunRecord = {
          sessionId: sessionId ?? generateSessionId(),
          startedAt,
          stoppedAt,
          summary: getRunSummary(snapshot),
        };
        return [record, ...prev].slice(0, MAX_RUNS_HISTORY);
      });
    }
  }, [isRecording, sessionId, sessionStartedAt, snapshot]);

  const reset = useCallback(() => {
    setSnapshot(getEmptySnapshot());
    setSessionStartTime(null);
    setSessionId(null);
    setSessionStartedAt(null);
    setSessionStoppedAt(null);
    setIsRecording(false);
  }, []);

  const clearHistory = useCallback(() => {
    setRunsHistory([]);
  }, []);

  const updateSnapshot = useCallback((update: SnapshotUpdate) => {
    setSnapshot((prev) => {
      const next = { ...prev };
      if (update.webVitals) next.webVitals = { ...prev.webVitals, ...update.webVitals };
      if (update.timeline) next.timeline = { ...prev.timeline, ...update.timeline };
      if (update.network) next.network = { ...prev.network, ...update.network };
      if (update.layoutShift) next.layoutShift = { ...prev.layoutShift, ...update.layoutShift };
      return next;
    });
  }, []);

  const value = useMemo<InstrumentationContextValue>(
    () => ({
      snapshot,
      isRecording,
      sessionStartTime,
      sessionId,
      sessionStartedAt,
      sessionStoppedAt,
      runsHistory,
      startRecording,
      stopRecording,
      reset,
      clearHistory,
      updateSnapshot,
    }),
    [
      snapshot,
      isRecording,
      sessionStartTime,
      sessionId,
      sessionStartedAt,
      sessionStoppedAt,
      runsHistory,
      startRecording,
      stopRecording,
      reset,
      clearHistory,
      updateSnapshot,
    ]
  );

  return (
    <InstrumentationContext.Provider value={value}>
      {children}
    </InstrumentationContext.Provider>
  );
}

/**
 * useInstrumentation
 *
 * Returns recording state and controls: start/stop/reset and the current snapshot.
 * Snapshot is only updated while isRecording is true and the collector is mounted (on /demo).
 */
export function useInstrumentation(): InstrumentationContextValue {
  const ctx = useContext(InstrumentationContext);
  if (!ctx) throw new Error('useInstrumentation must be used within InstrumentationProvider');
  return ctx;
}
