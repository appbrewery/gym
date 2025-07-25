import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../lib/auth';

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
    <nav id="main-navigation" style={{ 
      padding: '1rem', 
      borderBottom: '1px solid #ddd',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
            Gym Booking
          </Link>
          
          {user && (
            <>
              {user.membershipType === 'admin' ? (
                <Link href="/admin" style={{ textDecoration: 'none' }}>
                  Admin Panel
                </Link>
              ) : (
                <>
                  <Link href="/schedule" style={{ textDecoration: 'none' }}>
                    Class Schedule
                  </Link>
                  <Link href="/my-bookings" style={{ textDecoration: 'none' }}>
                    My Bookings
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
        <div>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Welcome, {user.name}</span>
              <button 
                id="logout-button"
                onClick={handleLogout}
                style={{ 
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button 
                id="login-button"
                style={{ 
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
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