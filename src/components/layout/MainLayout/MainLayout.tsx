import { Outlet } from 'react-router-dom';
import { SkipLink } from '@/components/ui/SkipLink';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import styles from './MainLayout.module.css';

export function MainLayout() {
  return (
    <>
      <SkipLink />
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.mainWrap}>
          <Header />
          <main id="main-content" className={styles.main} role="main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
