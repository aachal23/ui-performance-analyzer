import type { DemoStressOptions } from '@/types/simulation';
import styles from './ControlPanel.module.css';

export interface ControlPanelProps {
  options: DemoStressOptions;
  onChange: (options: DemoStressOptions) => void;
  disabled?: boolean;
}

const TOGGLES: Array<{ key: keyof DemoStressOptions; label: string; hint: string }> = [
  {
    key: 'largeImages',
    label: 'Large images',
    hint: 'Load larger image dimensions (worse LCP, more network).',
  },
  {
    key: 'extraApiDelay',
    label: 'Extra API delay',
    hint: 'Simulate slow API (delayed data, affects TTFB/LCP).',
  },
  {
    key: 'heavyRerenders',
    label: 'Heavy re-renders',
    hint: 'Frequent state updates (main thread, INP).',
  },
  {
    key: 'animations',
    label: 'Animations',
    hint: 'Continuous animations (paint, main thread).',
  },
];

export function ControlPanel({
  options,
  onChange,
  disabled = false,
}: Readonly<ControlPanelProps>) {
  const handleToggle = (key: keyof DemoStressOptions, value: boolean) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <fieldset className={styles.panel} aria-describedby="stress-controls-desc">
      <legend id="stress-controls-heading" className={styles.heading}>
        Stress controls
      </legend>
      <p id="stress-controls-desc" className={styles.subtitle}>
        Toggle simulations to observe impact on Web Vitals and timeline.
      </p>
      <div className={styles.toggles}>
        {TOGGLES.map(({ key, label, hint }) => (
          <label
            key={key}
            className={styles.toggle}
            title={hint}
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => handleToggle(key, e.target.checked)}
              disabled={disabled}
              aria-describedby={`${key}-hint`}
              aria-label={`${label}: ${hint}`}
            />
            <span className={styles.toggleLabel}>{label}</span>
            <span id={`${key}-hint`} className={styles.hint}>
              {hint}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
