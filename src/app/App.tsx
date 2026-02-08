import { Providers } from './providers';
import { AppRouter } from './router';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.root}>
      <Providers>
        <AppRouter />
      </Providers>
    </div>
  );
}
