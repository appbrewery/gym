import { useState, useEffect } from 'react';
import { formatTime, isPast } from '../../utils/dateHelpers';
import { getCurrentUser } from '../../lib/auth';
import { getDB } from '../../lib/db';
import { withNetworkSimulation } from '../../lib/network';
import { updateClassBookingCount } from '../../lib/classUtils';
import styles from './ClassCard.module.css';


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
          
          // Update class booking count based on actual bookings
          await updateClassBookingCount(classData.id);
          
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

  const getCardClasses = () => {
    let classes = [styles.card];
    if (loading) classes.push(styles.loading);
    if (isPastClass) classes.push(styles.past);
    return classes.join(' ');
  };

  const getClassNameClasses = () => {
    return `${styles.className} ${styles[classData.type]}`;
  };

  const getButtonClasses = () => {
    let classes = [styles.bookButton];
    if (loading) {
      classes.push(styles.loading);
    } else if (isBooked) {
      classes.push(styles.booked);
    } else if (isWaitlisted) {
      classes.push(styles.waitlisted);
    } else if (isFullyBooked) {
      classes.push(styles.waitlist);
    } else {
      classes.push(styles.available);
    }
    return classes.join(' ');
  };

  return (
    <div
      id={`class-card-${classData.id}`}
      className={getCardClasses()}
      data-class-id={classData.id}
      data-class-type={classData.type}
      data-class-status={classData.status}
      data-available-spots={availableSpots}
      data-user-booked={isBooked}
      data-user-waitlisted={isWaitlisted}
      data-is-past-class={isPastClass}
      data-is-fully-booked={isFullyBooked}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardContent}>
          <h3 
            id={`class-name-${classData.id}`}
            className={getClassNameClasses()}
          >
            {classData.name}
          </h3>
          <p 
            id={`class-time-${classData.id}`}
            className={styles.classDetail}
          >
            <strong>Time:</strong> {formatTime(classData.dateTime)}
          </p>
          <p className={styles.classDetail}>
            <strong>Instructor:</strong> {classData.instructor}
          </p>
          <p className={styles.classDetail}>
            <strong>Duration:</strong> {classData.duration} minutes
          </p>
          <p 
            id={`class-availability-${classData.id}`}
            className={styles.classDetail}
          >
            <strong>Available:</strong> {availableSpots} / {classData.capacity} spots
          </p>
        </div>
        
        <div className={styles.cardActions}>
          {isPastClass ? (
            <span 
              id={`completed-label-${classData.id}`}
              className={styles.completedLabel}
            >
              Completed
            </span>
          ) : isBooked ? (
            <button
              id={`book-button-${classData.id}`}
              disabled
              className={getButtonClasses()}
            >
              Booked
            </button>
          ) : isWaitlisted ? (
            <button
              id={`book-button-${classData.id}`}
              disabled
              className={getButtonClasses()}
            >
              Waitlisted
            </button>
          ) : isFullyBooked ? (
            <button
              id={`book-button-${classData.id}`}
              onClick={handleBooking}
              disabled={loading}
              aria-busy={loading}
              className={getButtonClasses()}
            >
              {loading ? 'Joining...' : 'Join Waitlist'}
            </button>
          ) : (
            <button
              id={`book-button-${classData.id}`}
              onClick={handleBooking}
              disabled={loading}
              aria-busy={loading}
              className={getButtonClasses()}
            >
              {loading ? 'Booking...' : 'Book Class'}
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div 
          id={`class-error-${classData.id}`}
          className={styles.errorMessage}
        >
          {error}
        </div>
      )}
    </div>
  );
}