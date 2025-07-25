import { getDB } from './db';

// Recalculate and update class booking counts based on actual bookings
export async function updateClassBookingCount(classId) {
  const db = await getDB();
  
  // Get the class
  const classData = await db.get('classes', classId);
  if (!classData) {
    throw new Error('Class not found');
  }
  
  // Count actual bookings for this class
  const bookings = await db.getAllByIndex('bookings', 'classId', classId);
  const actualBookingCount = bookings.length;
  
  // Update class with correct count and status
  const updatedClass = {
    ...classData,
    currentBookings: actualBookingCount,
    status: actualBookingCount >= classData.capacity ? 'full' : 'available'
  };
  
  await db.update('classes', updatedClass);
  return updatedClass;
}

// Get class with real-time booking count
export async function getClassWithCurrentCount(classId) {
  const db = await getDB();
  
  const classData = await db.get('classes', classId);
  if (!classData) {
    return null;
  }
  
  // Count actual bookings
  const bookings = await db.getAllByIndex('bookings', 'classId', classId);
  const actualBookingCount = bookings.length;
  
  return {
    ...classData,
    currentBookings: actualBookingCount,
    status: actualBookingCount >= classData.capacity ? 'full' : 'available'
  };
}