import { ReactNode } from 'react';
import styles from './SkipLink.module.css';

interface SkipLinkProps {
  href?: string;
  children?: ReactNode;
}

export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a href={href} className={styles.skipLink}>
      {children}
    </a>
  );
}
