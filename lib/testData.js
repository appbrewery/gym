import { getDB } from './db';
import { initializeNetworkSettings } from './network';

// Class types configuration
const CLASS_TYPES = {
  yoga: {
    name: 'Yoga',
    duration: 60,
    capacity: 20,
    color: '#8B5CF6',
    instructors: ['Sarah Chen', 'Maya Patel', 'Emma Wilson']
  },
  spin: {
    name: 'Spin',
    duration: 45,
    capacity: 10,
    color: '#3B82F6',
    instructors: ['Mike Johnson', 'Carlos Rodriguez', 'Lisa Thompson']
  },
  hiit: {
    name: 'HIIT',
    duration: 30,
    capacity: 15,
    color: '#EF4444',
    instructors: ['James Kim', 'Alex Turner', 'Rachel Green']
  }
};

// Time slots for classes
const TIME_SLOTS = ['07:00', '08:00', '09:00', '17:00', '18:00', '19:00'];

// Generate a single class
function generateClass(type, date, timeSlot, isPast = false) {
  const classConfig = CLASS_TYPES[type];
  const dateTime = new Date(`${date}T${timeSlot}`);
  const instructor = classConfig.instructors[Math.floor(Math.random() * classConfig.instructors.length)];
  
  // Generate booking status
  let currentBookings = 0;
  let status = 'available';
  
  if (isPast) {
    status = 'completed';
    currentBookings = Math.floor(Math.random() * classConfig.capacity);
  } else {
    // Random booking levels for future classes
    const bookingPercentage = Math.random();
    if (bookingPercentage > 0.8) {
      // 20% chance of full class
      currentBookings = classConfig.capacity;
      status = 'full';
    } else {
      currentBookings = Math.floor(bookingPercentage * classConfig.capacity);
    }
  }
  
  return {
    id: `${type}-${date}-${timeSlot.replace(':', '')}`,
    type: type,
    name: `${classConfig.name} Class`,
    instructor: instructor,
    dateTime: dateTime.toISOString(),
    duration: classConfig.duration,
    capacity: classConfig.capacity,
    currentBookings: currentBookings,
    status: status
  };
}

// Generate all classes for a date range
function generateClasses() {
  const classes = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate 3 weeks of classes (7 days past, 14 days future)
  for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];
    const isPast = dayOffset < 0;
    
    // Generate classes for each time slot
    TIME_SLOTS.forEach(timeSlot => {
      // Generate one class of each type per time slot
      Object.keys(CLASS_TYPES).forEach(type => {
        // Skip some slots randomly to create variety
        if (Math.random() > 0.3) {
          classes.push(generateClass(type, dateStr, timeSlot, isPast));
        }
      });
    });
  }
  
  return classes;
}

// Generate test users
function generateUsers() {
  return [
    {
      id: 'user_default_1',
      email: 'student@test.com',
      password: 'password123',
      name: 'Test Student',
      memberSince: new Date('2024-01-15').toISOString(),
      membershipType: 'standard'
    },
    {
      id: 'user_default_2',
      email: 'premium@test.com',
      password: 'premium123',
      name: 'Premium Member',
      memberSince: new Date('2023-06-20').toISOString(),
      membershipType: 'premium'
    },
    {
      id: 'user_default_3',
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Admin User',
      memberSince: new Date('2023-01-01').toISOString(),
      membershipType: 'admin'
    }
  ];
}

// Generate sample bookings for existing users
function generateSampleBookings(users, classes) {
  const bookings = [];
  const futureClasses = classes.filter(c => c.status !== 'completed');
  
  // Create some bookings for the default user
  const defaultUser = users[0];
  const bookingCount = Math.min(5, futureClasses.length);
  
  for (let i = 0; i < bookingCount; i++) {
    const randomClass = futureClasses[Math.floor(Math.random() * futureClasses.length)];
    bookings.push({
      id: `booking_${Date.now()}_${i}`,
      userId: defaultUser.id,
      classId: randomClass.id,
      bookedAt: new Date().toISOString(),
      status: 'confirmed'
    });
  }
  
  return bookings;
}

// Initialize database with test data
export async function initializeTestData() {
  const db = await getDB();
  
  try {
    // Initialize network settings
    await initializeNetworkSettings();
    
    // Check if data already exists
    const existingUsers = await db.getAll('users');
    if (existingUsers.length > 0) {
      console.log('Test data already exists');
      return {
        users: existingUsers.length,
        classes: (await db.getAll('classes')).length,
        bookings: (await db.getAll('bookings')).length
      };
    }
    
    // Generate and insert test data
    const users = generateUsers();
    const classes = generateClasses();
    const bookings = generateSampleBookings(users, classes);
    
    // Insert users
    console.log('Inserting users...');
    for (const user of users) {
      try {
        await db.add('users', user);
        console.log(`Added user: ${user.email}`);
      } catch (e) {
        console.error(`Failed to add user ${user.email}:`, e);
      }
    }
    
    // Insert classes
    console.log('Inserting classes...');
    for (const classItem of classes) {
      try {
        await db.add('classes', classItem);
      } catch (e) {
        console.error(`Failed to add class ${classItem.id}:`, e);
      }
    }
    
    // Insert bookings
    console.log('Inserting bookings...');
    for (const booking of bookings) {
      try {
        await db.add('bookings', booking);
        console.log(`Added booking: ${booking.id}`);
      } catch (e) {
        console.error(`Failed to add booking ${booking.id}:`, e);
      }
    }
    
    console.log(`Initialized test data:
      - ${users.length} users
      - ${classes.length} classes
      - ${bookings.length} sample bookings`);
    
    return {
      users: users.length,
      classes: classes.length,
      bookings: bookings.length
    };
  } catch (error) {
    console.error('Failed to initialize test data:', error);
    throw error;
  }
}

// Reset all data
export async function resetAllData() {
  const db = await getDB();
  await db.clearAll();
  return initializeTestData();
}

// Clear only bookings and waitlist
export async function clearBookingsOnly() {
  const db = await getDB();
  await db.clear('bookings');
  await db.clear('waitlist');
  console.log('Cleared all bookings and waitlist entries');
}