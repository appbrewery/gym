import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser } from '../lib/auth';
import { getDB } from '../lib/db';
import { withNetworkSimulation } from '../lib/network';
import { formatDateTime, isPast } from '../utils/dateHelpers';
import { updateClassBookingCount } from '../lib/classUtils';

const CLASS_COLORS = {
  yoga: '#8B5CF6',
  spin: '#3B82F6',
  hiit: '#EF4444'
};

export default function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Redirect admin users to admin panel
    const user = getCurrentUser();
    if (user && user.membershipType === 'admin') {
      router.push('/admin');
      return;
    }

    loadUserBookings();
  }, [router]);

  const loadUserBookings = async () => {
    try {
      const user = getCurrentUser();
      const db = await getDB();
      
      // Get user's bookings
      const userBookings = await db.getAllByIndex('bookings', 'userId', user.userId);
      
      // Get class details for each booking
      const bookingsWithClasses = await Promise.all(
        userBookings.map(async (booking) => {
          const classData = await db.get('classes', booking.classId);
          return { ...booking, classData };
        })
      );
      
      // Sort by class date
      bookingsWithClasses.sort((a, b) => 
        new Date(a.classData.dateTime) - new Date(b.classData.dateTime)
      );
      
      // Separate past and future bookings
      const futureBookings = bookingsWithClasses.filter(b => !isPast(b.classData.dateTime));
      
      // Get user's waitlist entries
      const userWaitlist = await db.getAllByIndex('waitlist', 'userId', user.userId);
      const waitlistWithClasses = await Promise.all(
        userWaitlist.map(async (entry) => {
          const classData = await db.get('classes', entry.classId);
          return { ...entry, classData };
        })
      );
      
      setBookings(futureBookings);
      setWaitlist(waitlistWithClasses.filter(w => !isPast(w.classData.dateTime)));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    setCancellingId(booking.id);
    setError('');
    
    try {
      await withNetworkSimulation(async () => {
        const db = await getDB();
        
        // Remove booking
        await db.delete('bookings', booking.id);
        
        // Check if anyone is on waitlist
        const waitlistEntries = await db.getAllByIndex('waitlist', 'classId', booking.classId);
        if (waitlistEntries.length > 0) {
          // Move first person from waitlist to booking
          const firstInLine = waitlistEntries.sort((a, b) => 
            new Date(a.joinedAt) - new Date(b.joinedAt)
          )[0];
          
          // Create booking for waitlisted user
          const newBooking = {
            id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: firstInLine.userId,
            classId: firstInLine.classId,
            bookedAt: new Date().toISOString(),
            status: 'confirmed'
          };
          
          await db.add('bookings', newBooking);
          await db.delete('waitlist', firstInLine.id);
        }
        
        // Update class booking count based on actual bookings
        await updateClassBookingCount(booking.classId);
        
        // Reload bookings
        await loadUserBookings();
      });
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLeaveWaitlist = async (entry) => {
    setCancellingId(entry.id);
    setError('');
    
    try {
      await withNetworkSimulation(async () => {
        const db = await getDB();
        await db.delete('waitlist', entry.id);
        await loadUserBookings();
      });
    } catch (err) {
      console.error('Failed to leave waitlist:', err);
      setError('Failed to leave waitlist. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <div>Loading your bookings...</div>;
  }

  return (
    <div id="my-bookings-page">
      <h1>My Bookings</h1>
      
      {error && (
        <div id="error-message" style={{ 
          color: 'red', 
          marginBottom: '1rem',
          padding: '0.5rem',
          border: '1px solid red',
          borderRadius: '4px',
          backgroundColor: '#fef2f2'
        }}>
          {error}
        </div>
      )}
      
      {bookings.length === 0 && waitlist.length === 0 ? (
        <p>You haven't booked any classes yet. <a href="/schedule">Browse available classes</a></p>
      ) : (
        <>
          {bookings.length > 0 && (
            <>
              <h2>Confirmed Bookings</h2>
              <div style={{ marginBottom: '2rem' }}>
                {bookings.map(booking => (
                  <div
                    key={booking.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h3 style={{ color: CLASS_COLORS[booking.classData.type], margin: '0 0 0.5rem 0' }}>
                        {booking.classData.name}
                      </h3>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>When:</strong> {formatDateTime(booking.classData.dateTime)}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Instructor:</strong> {booking.classData.instructor}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Duration:</strong> {booking.classData.duration} minutes
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      disabled={cancellingId === booking.id}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: cancellingId === booking.id ? '#ccc' : '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: cancellingId === booking.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {waitlist.length > 0 && (
            <>
              <h2>Waitlist</h2>
              <div>
                {waitlist.map(entry => (
                  <div
                    key={entry.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <div>
                      <h3 style={{ color: CLASS_COLORS[entry.classData.type], margin: '0 0 0.5rem 0' }}>
                        {entry.classData.name} (Waitlist)
                      </h3>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>When:</strong> {formatDateTime(entry.classData.dateTime)}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Instructor:</strong> {entry.classData.instructor}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLeaveWaitlist(entry)}
                      disabled={cancellingId === entry.id}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: cancellingId === entry.id ? '#ccc' : '#6B7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: cancellingId === entry.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {cancellingId === entry.id ? 'Leaving...' : 'Leave Waitlist'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}