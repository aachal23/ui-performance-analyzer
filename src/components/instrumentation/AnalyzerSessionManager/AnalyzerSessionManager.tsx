import { useInstrumentation } from '@/contexts/InstrumentationContext';
import type { RunRecord } from '@/types/instrumentation';
import styles from './AnalyzerSessionManager.module.css';

export type SessionManagerMode = 'full' | 'summary';

export interface AnalyzerSessionManagerProps {
  /** full: Start/Stop/Reset + session info + history. summary: session info + history + Reset only (for Analyzer/layout). */
  mode?: SessionManagerMode;
  /** Optional: show runs history list. */
  showHistory?: boolean;
  /** Optional: extra content after main controls (e.g. overlay toggle, link). */
  children?: React.ReactNode;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function RunHistoryItem({ run }: Readonly<{ run: RunRecord }>) {
  const duration = run.stoppedAt - run.startedAt;
  return (
    <div className={styles.runItem} title={run.sessionId}>
      <span className={styles.runId}>{run.sessionId.slice(0, 20)}…</span>
      <span className={styles.runMeta}>
        {formatTime(run.startedAt)} – {formatDuration(duration)}
      </span>
      <span className={styles.runSummary}>
        CLS {run.summary.totalCls.toFixed(3)}
        {run.summary.lcp != null && ` · LCP ${(run.summary.lcp / 1000).toFixed(2)}s`}
        {' · '}{run.summary.networkCount} req
      </span>
    </div>
  );
}

export function AnalyzerSessionManager({
  mode = 'full',
  showHistory = true,
  children,
}: Readonly<AnalyzerSessionManagerProps>) {
  const {
    isRecording,
    sessionId,
    sessionStartedAt,
    sessionStoppedAt,
    runsHistory,
    startRecording,
    stopRecording,
    reset,
    clearHistory,
  } = useInstrumentation();

  const showControls = mode === 'full';

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        {showControls && (
          <>
            <button
              type="button"
              className={isRecording ? styles.btnStop : styles.btnStart}
              onClick={isRecording ? stopRecording : startRecording}
              aria-pressed={isRecording}
              aria-label={isRecording ? 'Stop session' : 'Start session'}
            >
              {isRecording ? 'Stop' : 'Start'}
            </button>
            <button
              type="button"
              className={styles.btnReset}
              onClick={reset}
              aria-label="Reset metrics and session"
            >
              Reset
            </button>
          </>
        )}
        {!showControls && (
          <button
            type="button"
            className={styles.btnReset}
            onClick={reset}
            aria-label="Reset metrics and session"
          >
            Reset
          </button>
        )}
        {children}
      </div>

      <div className={styles.sessionInfo}>
        {sessionId && (
          <div className={styles.sessionRow}>
            <span className={styles.sessionLabel}>Session</span>
            <span className={styles.sessionId} title={sessionId}>
              {sessionId}
            </span>
          </div>
        )}
        {sessionStartedAt != null && (
          <div className={styles.sessionRow}>
            <span className={styles.sessionLabel}>Started</span>
            <span className={styles.sessionTime}>{formatTime(sessionStartedAt)}</span>
          </div>
        )}
        {sessionStoppedAt != null && !isRecording && (
          <div className={styles.sessionRow}>
            <span className={styles.sessionLabel}>Stopped</span>
            <span className={styles.sessionTime}>{formatTime(sessionStoppedAt)}</span>
          </div>
        )}
        {isRecording && (
          <span className={styles.recordingBadge} aria-live="polite">
            Recording…
          </span>
        )}
      </div>

      {showHistory && runsHistory.length > 0 && (
        <div className={styles.history}>
          <div className={styles.historyHeader}>
            <span className={styles.historyTitle}>Runs</span>
            <button
              type="button"
              className={styles.clearHistoryBtn}
              onClick={clearHistory}
              aria-label="Clear runs history"
            >
              Clear history
            </button>
          </div>
          <ul className={styles.runList} aria-label="Session runs history">
            {runsHistory.slice(0, 10).map((run) => (
              <li key={run.sessionId}>
                <RunHistoryItem run={run} />
              </li>
            ))}
          </ul>
          {runsHistory.length > 10 && (
            <p className={styles.historyNote}>Showing latest 10 of {runsHistory.length}</p>
          )}
        </div>
      )}
    </div>
  );
}
