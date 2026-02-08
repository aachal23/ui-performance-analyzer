import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { WebVitalMetric, WebVitalName, WebVitalsSnapshot } from '@/types/webVitals';
import { WEB_VITALS_UNITS } from '@/types/webVitals';
import styles from './WebVitalsDashboard.module.css';

export interface WebVitalsDashboardProps {
  metricsList: WebVitalMetric[];
  history: WebVitalsSnapshot[];
}

function formatValue(name: WebVitalName, value: number): string {
  const unit = WEB_VITALS_UNITS[name];
  return unit ? `${Math.round(value)} ${unit}` : value.toFixed(3);
}

function getRatingColor(rating: WebVitalMetric['rating']): string {
  switch (rating) {
    case 'good':
      return 'var(--vital-good)';
    case 'needs-improvement':
      return 'var(--vital-needs-improvement)';
    case 'poor':
      return 'var(--vital-poor)';
    default:
      return 'var(--color-text-muted)';
  }
}

/** Single metric card: name, value, score color. */
function MetricCard({ metric }: Readonly<{ metric: WebVitalMetric }>) {
  const color = getRatingColor(metric.rating);
  return (
    <div className={styles.card} style={{ borderLeftColor: color }}>
      <span className={styles.cardName} aria-label={`${metric.name} metric`}>
        {metric.name}
      </span>
      <span className={styles.cardValue} style={{ color }}>
        {formatValue(metric.name, metric.value)}
      </span>
      <span className={styles.cardRating} style={{ color }}>
        {metric.rating.replace('-', ' ')}
      </span>
    </div>
  );
}

/**
 * Timeline chart data: one point per snapshot.
 * CLS is scaled by 1000 so it fits on a similar scale to ms for a single Y-axis (optional).
 * We use two Y axes: left for ms (LCP, FCP, INP, TTFB), right for CLS.
 */
function buildTimelineData(history: WebVitalsSnapshot[]): Array<Record<string, number | string>> {
  return history.map((s, i) => {
    const time = new Date(s.timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return {
      time: history.length > 10 ? `${i + 1}` : time,
      fullTime: time,
      LCP: s.LCP ?? 0,
      FCP: s.FCP ?? 0,
      CLS: (s.CLS ?? 0) * 1000,
      INP: s.INP ?? 0,
      TTFB: s.TTFB ?? 0,
    };
  });
}

export function WebVitalsDashboard({ metricsList, history }: Readonly<WebVitalsDashboardProps>) {
  const timelineData = buildTimelineData(history);
  const barData = metricsList.map((m) => ({
    name: m.name,
    value: m.name === 'CLS' ? m.value * 1000 : m.value,
    fill: getRatingColor(m.rating),
  }));

  return (
    <div className={styles.dashboard}>
      <section className={styles.section} aria-labelledby="vitals-cards-heading">
        <h2 id="vitals-cards-heading" className={styles.sectionTitle}>
          Current metrics
        </h2>
        <div className={styles.cards}>
          {metricsList.length === 0 ? (
            <p className={styles.empty}>Collecting metrics… Refresh or interact with the page.</p>
          ) : (
            metricsList.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))
          )}
        </div>
      </section>

      {barData.length > 0 && (
        <section className={styles.section} aria-labelledby="vitals-bars-heading">
          <h2 id="vitals-bars-heading" className={styles.sectionTitle}>
            Score overview
          </h2>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                  label={{
                    value: 'ms (CLS × 1000)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'var(--color-text-muted)',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                  labelStyle={{ color: 'var(--color-text)' }}
                  formatter={(value: number, name: string) => [
                    name === 'CLS' ? (value / 1000).toFixed(3) : `${value} ms`,
                    'Value',
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="value" name="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {timelineData.length > 0 && (
        <section className={styles.section} aria-labelledby="vitals-timeline-heading">
          <h2 id="vitals-timeline-heading" className={styles.sectionTitle}>
            Timeline
          </h2>
          <figure className={styles.chartWrap} aria-labelledby="vitals-timeline-heading">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                  label={{
                    value: 'ms (CLS × 1000)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'var(--color-text-muted)',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'CLS' ? (value / 1000).toFixed(3) : `${value} ms`,
                    name,
                  ]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullTime ?? ''
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => value}
                  iconType="line"
                />
                <Line type="monotone" dataKey="LCP" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="FCP" stroke="var(--color-success)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="CLS" stroke="var(--color-warning)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="INP" stroke="#a371f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TTFB" stroke="#79c0ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </figure>
        </section>
      )}
    </div>
  );
}
