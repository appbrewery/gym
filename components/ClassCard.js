import { useState, useEffect } from 'react';
import { formatTime, isPast } from '../utils/dateHelpers';
import { getCurrentUser } from '../lib/auth';
import { getDB } from '../lib/db';
import { withNetworkSimulation } from '../lib/network';

const CLASS_COLORS = {
  yoga: '#8B5CF6',
  spin: '#3B82F6',
  hiit: '#EF4444'
};

export default function ClassCard({ classData, onBookingChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  
  const availableSpots = classData.capacity - classData.currentBookings;
  const isFullyBooked = availableSpots === 0;
  const isPastClass = isPast(classData.dateTime);
  const user = getCurrentUser();

  useEffect(() => {
    checkBookingStatus();
  }, [classData.id]);

  const checkBookingStatus = async () => {
    if (!user) return;
    
    try {
      const db = await getDB();
      
      // Check if user has booked this class
      const booking = await db.getByIndex('bookings', 'userClassCombo', [user.userId, classData.id]);
      setIsBooked(!!booking);
      
      // Check if user is on waitlist
      const waitlist = await db.getByIndex('waitlist', 'userClassCombo', [user.userId, classData.id]);
      setIsWaitlisted(!!waitlist);
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setError('');
    setLoading(true);

    try {
      await withNetworkSimulation(async () => {
        const db = await getDB();
        
        if (isFullyBooked) {
          // Join waitlist
          const existingWaitlist = await db.getByIndex('waitlist', 'userClassCombo', [user.userId, classData.id]);
          if (existingWaitlist) {
            throw new Error('You are already on the waitlist for this class');
          }

          const waitlistEntry = {
            id: `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.userId,
            classId: classData.id,
            joinedAt: new Date().toISOString()
          };

          await db.add('waitlist', waitlistEntry);
          setIsWaitlisted(true);
        } else {
          // Book class
          const existingBooking = await db.getByIndex('bookings', 'userClassCombo', [user.userId, classData.id]);
          if (existingBooking) {
            throw new Error('You have already booked this class');
          }

          const booking = {
            id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.userId,
            classId: classData.id,
            bookedAt: new Date().toISOString(),
            status: 'confirmed'
          };

          await db.add('bookings', booking);
          
          // Update class booking count
          const updatedClass = {
            ...classData,
            currentBookings: classData.currentBookings + 1,
            status: classData.currentBookings + 1 >= classData.capacity ? 'full' : 'available'
          };
          await db.update('classes', updatedClass);
          
          setIsBooked(true);
        }

        // Trigger refresh
        if (onBookingChange) onBookingChange();
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id={`class-card-${classData.id}`}
      className={`class-card ${loading ? 'loading' : ''}`}
      data-class-id={classData.id}
      data-class-type={classData.type}
      data-class-status={classData.status}
      data-available-spots={availableSpots}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        opacity: isPastClass ? 0.6 : 1
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3 style={{ color: CLASS_COLORS[classData.type], margin: '0 0 0.5rem 0' }}>
            {classData.name}
          </h3>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Time:</strong> {formatTime(classData.dateTime)}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Instructor:</strong> {classData.instructor}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Duration:</strong> {classData.duration} minutes
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Available:</strong> {availableSpots} / {classData.capacity} spots
          </p>
        </div>
        
        <div>
          {isPastClass ? (
            <span style={{ color: '#666' }}>Completed</span>
          ) : isBooked ? (
            <button
              id={`book-button-${classData.id}`}
              disabled
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'not-allowed'
              }}
            >
              Booked
            </button>
          ) : isWaitlisted ? (
            <button
              id={`book-button-${classData.id}`}
              disabled
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'not-allowed'
              }}
            >
              Waitlisted
            </button>
          ) : isFullyBooked ? (
            <button
              id={`book-button-${classData.id}`}
              onClick={handleBooking}
              disabled={loading}
              aria-busy={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#ccc' : '#F59E0B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Joining...' : 'Join Waitlist'}
            </button>
          ) : (
            <button
              id={`book-button-${classData.id}`}
              onClick={handleBooking}
              disabled={loading}
              aria-busy={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#ccc' : '#F97316',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Booking...' : 'Book Class'}
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div style={{ 
          marginTop: '0.5rem', 
          color: 'red',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}