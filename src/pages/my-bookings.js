import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser } from '../lib/auth';
import { getDB } from '../lib/db';
import { withNetworkSimulation } from '../lib/network';
import { formatDateTime, isPast } from '../utils/dateHelpers';
import { updateClassBookingCount } from '../lib/classUtils';
import styles from './MyBookings.module.css';


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
      
      // Separate past and future bookings first
      const futureBookings = bookingsWithClasses.filter(b => !isPast(b.classData.dateTime));
      
      // Sort future bookings by class date (earliest first)
      futureBookings.sort((a, b) => 
        new Date(a.classData.dateTime) - new Date(b.classData.dateTime)
      );
      
      // Get user's waitlist entries
      const userWaitlist = await db.getAllByIndex('waitlist', 'userId', user.userId);
      const waitlistWithClasses = await Promise.all(
        userWaitlist.map(async (entry) => {
          const classData = await db.get('classes', entry.classId);
          return { ...entry, classData };
        })
      );
      
      // Filter and sort waitlist entries by class date (earliest first)
      const futureWaitlist = waitlistWithClasses.filter(w => !isPast(w.classData.dateTime));
      futureWaitlist.sort((a, b) => 
        new Date(a.classData.dateTime) - new Date(b.classData.dateTime)
      );
      
      setBookings(futureBookings);
      setWaitlist(futureWaitlist);
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

  const getButtonClasses = (isLoading, type) => {
    let classes = [styles.cancelButton];
    if (isLoading) {
      classes.push(styles.loading);
    } else {
      classes.push(styles[type]);
    }
    return classes.join(' ');
  };

  return (
    <div 
      id="my-bookings-page" 
      className={styles.bookingsContainer}
      data-bookings-count={bookings.length}
      data-waitlist-count={waitlist.length}
      data-loading={loading}
    >
      <h1 className={styles.pageTitle}>My Bookings</h1>
      
      {error && (
        <div id="error-message" className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {bookings.length === 0 && waitlist.length === 0 ? (
        <div id="empty-bookings-state" className={styles.emptyState}>
          <p>You haven't booked any classes yet. <a href="/schedule">Browse available classes</a></p>
        </div>
      ) : (
        <>
          {bookings.length > 0 && (
            <div id="confirmed-bookings-section" className={styles.section}>
              <h2 id="confirmed-bookings-title" className={styles.sectionTitle}>Confirmed Bookings</h2>
              <div>
                {bookings.map(booking => (
                  <div 
                    key={booking.id} 
                    id={`booking-card-${booking.id}`}
                    className={styles.bookingCard}
                    data-booking-id={booking.id}
                    data-class-type={booking.classData.type}
                    data-booking-status="confirmed"
                  >
                    <div className={styles.bookingDetails}>
                      <h3 
                        id={`booking-class-name-${booking.id}`}
                        className={styles[booking.classData.type]}
                      >
                        {booking.classData.name}
                      </h3>
                      <p>
                        <strong>When:</strong> {formatDateTime(booking.classData.dateTime)}
                      </p>
                      <p>
                        <strong>Instructor:</strong> {booking.classData.instructor}
                      </p>
                      <p>
                        <strong>Duration:</strong> {booking.classData.duration} minutes
                      </p>
                    </div>
                    <button
                      id={`cancel-booking-${booking.id}`}
                      onClick={() => handleCancelBooking(booking)}
                      disabled={cancellingId === booking.id}
                      className={getButtonClasses(cancellingId === booking.id, 'cancel')}
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {waitlist.length > 0 && (
            <div id="waitlist-section" className={styles.section}>
              <h2 id="waitlist-title" className={styles.sectionTitle}>Waitlist</h2>
              <div>
                {waitlist.map(entry => (
                  <div 
                    key={entry.id} 
                    id={`waitlist-card-${entry.id}`}
                    className={`${styles.bookingCard} ${styles.waitlist}`}
                    data-waitlist-id={entry.id}
                    data-class-type={entry.classData.type}
                    data-booking-status="waitlisted"
                  >
                    <div className={styles.bookingDetails}>
                      <h3 
                        id={`waitlist-class-name-${entry.id}`}
                        className={styles[entry.classData.type]}
                      >
                        {entry.classData.name} (Waitlist)
                      </h3>
                      <p>
                        <strong>When:</strong> {formatDateTime(entry.classData.dateTime)}
                      </p>
                      <p>
                        <strong>Instructor:</strong> {entry.classData.instructor}
                      </p>
                    </div>
                    <button
                      id={`leave-waitlist-${entry.id}`}
                      onClick={() => handleLeaveWaitlist(entry)}
                      disabled={cancellingId === entry.id}
                      className={getButtonClasses(cancellingId === entry.id, 'leave')}
                    >
                      {cancellingId === entry.id ? 'Leaving...' : 'Leave Waitlist'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}