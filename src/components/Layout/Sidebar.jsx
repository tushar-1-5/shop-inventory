import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '&#x2302;' },
  { to: '/sales', label: 'Sales', icon: '&#x1F6D2;' },
  { to: '/products', label: 'Products', icon: '&#x25A3;' },
  { to: '/categories', label: 'Categories', icon: '&#x2630;' },
  { to: '/activity', label: 'Activity Log', icon: '&#x231A;' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { profile, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
  }

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>&#x1F4E6;</span>
          <span className={styles.logoText}>Shop Inventory</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              <span
                className={styles.navIcon}
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            {profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{profile?.display_name || 'User'}</span>
            <span className={styles.userEmail}>{profile?.email}</span>
          </div>
          <button className={styles.signOut} onClick={handleSignOut} title="Sign out">
            &#x2192;
          </button>
        </div>
      </aside>
    </>
  );
}
