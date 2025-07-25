import { useState } from 'react';
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
  
  const availableSpots = classData.capacity - classData.currentBookings;
  const isFullyBooked = availableSpots === 0;
  const isPastClass = isPast(classData.dateTime);
  const user = getCurrentUser();

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
        
        // Check if user already booked this class
        const existingBooking = await db.getByIndex('bookings', 'userClassCombo', [user.userId, classData.id]);
        if (existingBooking) {
          throw new Error('You have already booked this class');
        }

        // Create booking
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
          ) : isFullyBooked ? (
            <button
              id={`book-button-${classData.id}`}
              disabled
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ccc',
                color: '#666',
                border: 'none',
                borderRadius: '4px',
                cursor: 'not-allowed'
              }}
            >
              Full
            </button>
          ) : (
            <button
              id={`book-button-${classData.id}`}
              onClick={handleBooking}
              disabled={loading}
              aria-busy={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#ccc' : CLASS_COLORS[classData.type],
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