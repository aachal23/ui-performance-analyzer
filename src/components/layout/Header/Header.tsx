import { useTheme } from '@/contexts/ThemeContext';
import styles from './Header.module.css';

export function Header() {
  const { resolved, setTheme } = useTheme();
  const nextTheme = resolved === 'dark' ? 'light' : 'dark';

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <div>
          <h1 className={styles.title}>UI Performance Analyzer</h1>
          <p className={styles.subtitle}>Web Vitals &amp; performance dashboard</p>
        </div>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={() => setTheme(nextTheme)}
          aria-label={`Switch to ${nextTheme} theme`}
          title={`Switch to ${nextTheme} theme`}
        >
          {resolved === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
}
