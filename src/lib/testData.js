import { getDB } from "./db";
import { initializeNetworkSettings } from "./network";

// Class types configuration
const CLASS_TYPES = {
  yoga: {
    name: "Yoga",
    duration: 60,
    capacity: 20,
    color: "#8B5CF6",
    instructors: ["Sarah Chen", "Maya Patel", "Emma Wilson"],
  },
  spin: {
    name: "Spin",
    duration: 45,
    capacity: 10,
    color: "#3B82F6",
    instructors: ["Mike Johnson", "Carlos Rodriguez", "Lisa Thompson"],
  },
  hiit: {
    name: "HIIT",
    duration: 30,
    capacity: 15,
    color: "#EF4444",
    instructors: ["James Kim", "Alex Turner", "Rachel Green"],
  },
};

// Time slots for classes
const TIME_SLOTS = ["07:00", "08:00", "09:00", "17:00", "18:00", "19:00"];

// Generate a single class
function generateClass(type, date, timeSlot) {
  const classConfig = CLASS_TYPES[type];
  const dateTime = new Date(`${date}T${timeSlot}`);
  const instructor =
    classConfig.instructors[
      Math.floor(Math.random() * classConfig.instructors.length)
    ];

  return {
    id: `${type}-${date}-${timeSlot.replace(":", "")}`,
    type: type,
    name: `${classConfig.name} Class`,
    instructor: instructor,
    dateTime: dateTime.toISOString(),
    duration: classConfig.duration,
    capacity: classConfig.capacity,
    currentBookings: 0, // Will be calculated from actual bookings
    status: "available", // Will be calculated from actual bookings
  };
}

// Generate all classes for a date range
function generateClasses() {
  const classes = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate only future classes for the next 10 days
  for (let dayOffset = 0; dayOffset <= 15; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split("T")[0];

    // Generate classes for each time slot
    TIME_SLOTS.forEach((timeSlot, index) => {
      // Rotate through class types to ensure variety
      const types = Object.keys(CLASS_TYPES);
      const typeIndex = index % types.length;
      const type = types[typeIndex];

      // Only create one class per time slot
      classes.push(generateClass(type, dateStr, timeSlot));
    });
  }

  return classes;
}

// Generate test users
function generateUsers() {
  const users = [
    {
      id: "user_default_1",
      email: "student@test.com",
      password: "password123",
      name: "Test Student",
      memberSince: new Date("2024-01-15").toISOString(),
      membershipType: "standard",
    },
    {
      id: "user_default_2",
      email: "premium@test.com",
      password: "premium123",
      name: "Premium Member",
      memberSince: new Date("2023-06-20").toISOString(),
      membershipType: "premium",
    },
    {
      id: "user_default_3",
      email: "admin@test.com",
      password: "admin123",
      name: "Admin User",
      memberSince: new Date("2023-01-01").toISOString(),
      membershipType: "admin",
    },
  ];

  // Generate additional test users for realistic booking scenarios
  const firstNames = [
    "Emma",
    "Liam",
    "Olivia",
    "Noah",
    "Ava",
    "Ethan",
    "Sophia",
    "Mason",
    "Isabella",
    "William",
    "Mia",
    "James",
    "Charlotte",
    "Benjamin",
    "Amelia",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
  ];

  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    users.push({
      id: `user_generated_${i + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      password: "password123",
      name: `${firstName} ${lastName}`,
      memberSince: new Date(
        2023 + Math.random(),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ).toISOString(),
      membershipType: Math.random() > 0.8 ? "premium" : "standard",
    });
  }

  return users;
}

// Generate realistic bookings and waitlists
function generateBookingsAndWaitlists(users, classes) {
  const bookings = [];
  const waitlists = [];

  // Track bookings per class to enforce capacity
  const classBookingCounts = {};
  classes.forEach((c) => {
    classBookingCounts[c.id] = 0;
  });

  // For each class, generate random bookings
  classes.forEach((classItem) => {
    const capacity = classItem.capacity;

    // Determine how full this class should be (0% to 120% to create waitlists)
    const demandLevel = Math.random();
    let targetBookings;

    if (demandLevel < 0.3) {
      // 30% chance: low demand (20-60% full)
      targetBookings = Math.floor(capacity * (0.2 + Math.random() * 0.4));
    } else if (demandLevel < 0.7) {
      // 40% chance: medium demand (60-90% full)
      targetBookings = Math.floor(capacity * (0.6 + Math.random() * 0.3));
    } else if (demandLevel < 0.9) {
      // 20% chance: high demand (full)
      targetBookings = capacity;
    } else {
      // 10% chance: very high demand (full + waitlist)
      targetBookings = Math.floor(capacity * (1.0 + Math.random() * 0.5)); // 100-150% demand
    }

    // Shuffle users to randomize bookings
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

    let bookingsMade = 0;
    let waitlistEntries = 0;

    for (let i = 0; i < Math.min(targetBookings, shuffledUsers.length); i++) {
      const user = shuffledUsers[i];

      if (bookingsMade < capacity) {
        // Add to confirmed bookings
        bookings.push({
          id: `booking_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          userId: user.id,
          classId: classItem.id,
          bookedAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // Random time in last 7 days
          status: "confirmed",
        });
        bookingsMade++;
        classBookingCounts[classItem.id]++;
      } else {
        // Add to waitlist
        waitlists.push({
          id: `waitlist_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          userId: user.id,
          classId: classItem.id,
          joinedAt: new Date(
            Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000
          ).toISOString(), // Random time in last 3 days
        });
        waitlistEntries++;
      }
    }
  });

  return { bookings, waitlists, classBookingCounts };
}

// Initialize database with test data
export async function initializeTestData() {
  const db = await getDB();

  try {
    // Initialize network settings
    await initializeNetworkSettings();

    // Check if data already exists
    const existingUsers = await db.getAll("users");
    if (existingUsers.length > 0) {
      console.log("Test data already exists");
      return {
        users: existingUsers.length,
        classes: (await db.getAll("classes")).length,
        bookings: (await db.getAll("bookings")).length,
      };
    }

    // Generate and insert test data
    const users = generateUsers();
    const classes = generateClasses();
    const { bookings, waitlists, classBookingCounts } =
      generateBookingsAndWaitlists(users, classes);

    // Insert users
    console.log("Inserting users...");
    for (const user of users) {
      try {
        await db.add("users", user);
        console.log(`Added user: ${user.email}`);
      } catch (e) {
        console.error(`Failed to add user ${user.email}:`, e);
      }
    }

    // Update classes with actual booking counts and insert
    console.log("Inserting classes...");
    for (const classItem of classes) {
      try {
        const bookingCount = classBookingCounts[classItem.id] || 0;
        const updatedClass = {
          ...classItem,
          currentBookings: bookingCount,
          status: bookingCount >= classItem.capacity ? "full" : "available",
        };
        await db.add("classes", updatedClass);
      } catch (e) {
        console.error(`Failed to add class ${classItem.id}:`, e);
      }
    }

    // Insert bookings
    console.log("Inserting bookings...");
    for (const booking of bookings) {
      try {
        await db.add("bookings", booking);
        console.log(`Added booking: ${booking.id}`);
      } catch (e) {
        console.error(`Failed to add booking ${booking.id}:`, e);
      }
    }

    // Insert waitlist entries
    console.log("Inserting waitlist entries...");
    for (const waitlistEntry of waitlists) {
      try {
        await db.add("waitlist", waitlistEntry);
        console.log(`Added waitlist entry: ${waitlistEntry.id}`);
      } catch (e) {
        console.error(`Failed to add waitlist entry ${waitlistEntry.id}:`, e);
      }
    }

    console.log(`Initialized test data:
      - ${users.length} users
      - ${classes.length} classes
      - ${bookings.length} bookings
      - ${waitlists.length} waitlist entries`);

    return {
      users: users.length,
      classes: classes.length,
      bookings: bookings.length,
      waitlists: waitlists.length,
    };
  } catch (error) {
    console.error("Failed to initialize test data:", error);
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
  await db.clear("bookings");
  await db.clear("waitlist");
  console.log("Cleared all bookings and waitlist entries");
}
