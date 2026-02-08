import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/demo', label: 'Demo App' },
  { to: '/analyzer', label: 'Analyzer' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/layout-shift', label: 'Layout Shift' },
  { to: '/network', label: 'Network' },
  { to: '/suggestions', label: 'Suggestions' },
] as const;

export function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <ul className={styles.list}>
        {navItems.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
              end={to === '/'}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
