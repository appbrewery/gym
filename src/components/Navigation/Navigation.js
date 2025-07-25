import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../../lib/auth';
import styles from './Navigation.module.css';

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, [router.pathname]); // Re-check when route changes

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push('/');
  };

  return (
    <nav id="main-navigation" className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link href="/" id="home-link" className={styles.logo}>
            Snack & Lift
          </Link>
          
          {user && (
            <>
              {user.membershipType === 'admin' ? (
                <Link href="/admin" id="admin-panel-link" className={styles.navLink}>
                  Admin Panel
                </Link>
              ) : (
                <>
                  <Link href="/schedule" id="schedule-link" className={styles.navLink}>
                    Class Schedule
                  </Link>
                  <Link href="/my-bookings" id="my-bookings-link" className={styles.navLink}>
                    My Bookings
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
        <div className={styles.rightSection}>
          {user ? (
            <div 
              id="user-info-section" 
              className={styles.userSection}
              data-user-name={user.name}
              data-user-type={user.membershipType}
              data-user-id={user.userId}
            >
              <span id="welcome-message">Welcome, {user.name}</span>
              <button 
                id="logout-button"
                onClick={handleLogout}
                className={styles.button}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button 
                id="login-button"
                className={styles.button}
              >
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}