import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isAuthenticated } from '../lib/auth';

export default function MyBookings() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div id="my-bookings-page">
      <h1>My Bookings</h1>
      <p>Your bookings will be displayed here...</p>
    </div>
  );
}