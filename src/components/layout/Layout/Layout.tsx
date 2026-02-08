import { Outlet } from 'react-router-dom';
import { SkipLink } from '@/components/ui/SkipLink';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <>
      <SkipLink />
      <div className={styles.layout}>
        <aside className={styles.aside}>
          <Sidebar />
        </aside>
        <div className={styles.mainWrap}>
          <Header />
          <main id="main-content" className={styles.main} role="main" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
