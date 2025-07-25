import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getCurrentUser } from '../lib/auth';

export default function Admin() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated or not admin
    const user = getCurrentUser();
    if (!user || user.membershipType !== 'admin') {
      router.push('/');
    }
  }, [router]);

  return (
    <div id="admin-page">
      <h1>Admin Panel</h1>
      <p>Admin controls will be implemented here...</p>
    </div>
  );
}