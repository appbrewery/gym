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
          <Link href="/" className={styles.logo}>
            Gym Booking
          </Link>
          
          {user && (
            <>
              {user.membershipType === 'admin' ? (
                <Link href="/admin" className={styles.navLink}>
                  Admin Panel
                </Link>
              ) : (
                <>
                  <Link href="/schedule" className={styles.navLink}>
                    Class Schedule
                  </Link>
                  <Link href="/my-bookings" className={styles.navLink}>
                    My Bookings
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
        <div className={styles.rightSection}>
          {user ? (
            <div className={styles.userSection}>
              <span>Welcome, {user.name}</span>
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