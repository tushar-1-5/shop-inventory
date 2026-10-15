import { useState } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        <header className={styles.mobileHeader}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            &#x2630;
          </button>
          <span className={styles.mobileTitle}>Shop Inventory</span>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
