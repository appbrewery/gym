# Gym Booking Simulator - Static Testing Site

A static Next.js application that simulates a gym class booking system for Selenium testing practice. Everything runs client-side with IndexedDB for persistence.

## Project Overview

Create a realistic gym booking website where students can practice Selenium automation. The site simulates network delays, authentication, booking flows, and various edge cases - all without requiring a backend.

## Core Features

- **Authentication**: Mock login/registration with session persistence
- **Class Booking**: Book yoga, spin, and HIIT classes with capacity limits
- **Network Simulation**: Configurable delays and random failures
- **Data Persistence**: Uses IndexedDB to store users, classes, and bookings
- **Admin Panel**: Reset data and configure network settings
- **Selenium-Friendly**: Consistent IDs and data attributes for easy testing

## Tech Stack

- **Next.js** (static site generation)
- **React** 
- **IndexedDB** for client-side data persistence
- **Pure CSS** (no external UI libraries needed)
- **No backend required**

## File Structure

```
gym-booking-simulator/
├── pages/
│   ├── index.js          # Landing page
│   ├── login.js          # Login/Register
│   ├── schedule.js       # Class schedule
│   ├── my-bookings.js    # User bookings
│   └── admin.js          # Admin controls
├── components/
│   ├── ClassCard.js      # Class display component
│   ├── BookingModal.js   # Booking confirmation
│   ├── NetworkSimulator.js # Network delay controls
│   └── [other components]
├── lib/
│   ├── db.js             # IndexedDB wrapper
│   ├── auth.js           # Mock authentication
│   ├── network.js        # Network simulation
│   └── testData.js       # Initial seed data
└── utils/
    └── dateHelpers.js    # Date formatting utilities
```

## Key Implementation Details

### 1. IndexedDB Schema

**Stores:**
- `users`: {id, email, password, name, memberSince, membershipType}
- `classes`: {id, type, name, instructor, dateTime, duration, capacity, currentBookings, status}
- `bookings`: {id, userId, classId, bookedAt, status}
- `waitlist`: {id, userId, classId, joinedAt}
- `systemSettings`: Network simulation config

### 2. Class Types & Capacity
- **Yoga**: 20 spots, 60 min, purple theme (#8B5CF6)
- **Spin**: 10 spots, 45 min, blue theme (#3B82F6)
- **HIIT**: 15 spots, 30 min, red theme (#EF4444)

### 3. Test Data Generation
- 3 weeks of classes (7 days past, 14 days future)
- 6 time slots per day (7am, 8am, 9am, 5pm, 6pm, 7pm)
- Random booking levels (some full, some available)
- Past classes marked as "completed"

### 4. Network Simulation
```javascript
{
  enabled: true,
  minDelay: 500,      // milliseconds
  maxDelay: 2000,     // milliseconds
  failureRate: 0.1    // 10% chance of failure
}
```

### 5. Selenium Selectors Pattern

**IDs:**
- Login form: `#login-form`
- Email input: `#email-input`
- Book button: `#book-button-{classId}`
- Class card: `#class-card-{classId}`
- Modal: `#booking-modal`

**Data Attributes:**
- `data-class-id="{classId}"`
- `data-class-type="{yoga|spin|hiit}"`
- `data-class-status="{available|full|completed}"`
- `data-available-spots="{number}"`

**Classes:**
- Loading state: `.loading`
- Error state: `.error`
- Success state: `.success`

### 6. Authentication Flow
- Default user: `student@test.com` / `password123`
- Auth stored in sessionStorage
- Protected routes redirect to login
- Mock token generation

### 7. Booking Rules
- Can't book past classes
- Can't book same class twice
- Full classes offer waitlist
- Network delays on all operations
- Random failures based on config

### 8. Error Handling
- Network timeouts
- Class full errors
- Authentication failures
- Form validation errors
- All errors display in `#error-message`

### 9. Admin Features
- Reset all data button
- Clear bookings only
- Toggle maintenance mode
- Network simulation controls
- View system statistics

## Component Examples

### ClassCard Component
```jsx
<div 
  className="class-card"
  id="class-card-yoga-2025-01-15-0700"
  data-class-id="yoga-2025-01-15-0700"
  data-class-type="yoga"
  data-class-status="available"
>
  <button id="book-button-yoga-2025-01-15-0700">
    Book Class
  </button>
</div>
```

### Loading States
```jsx
// Add 'loading' class during async operations
<div className={`class-card ${isLoading ? 'loading' : ''}`}>
  <button aria-busy={isLoading}>
    {isLoading ? 'Booking...' : 'Book Class'}
  </button>
</div>
```

## Setup Instructions

1. Create Next.js app: `npx create-next-app@latest gym-booking-simulator`
2. Install as static site (no API routes needed)
3. Copy the provided components and lib files
4. Build: `npm run build && npm run export`
5. Deploy the `out` directory to any static host

## Testing Scenarios for Students

1. **Happy Path**: Login → Browse classes → Book available class → View booking
2. **Full Class**: Attempt to book full class → Join waitlist
3. **Network Issues**: Enable high failure rate → Retry operations
4. **Validation**: Submit invalid forms → Check error messages
5. **Past Classes**: Verify can't book completed classes
6. **Double Booking**: Try booking same class twice
7. **Reset Flow**: Use admin panel → Reset → Verify clean state

## Deployment

The site will be deployed to GitHub Pages (out of scope)

No environment variables or backend setup required!

## Notes for Implementation

- Keep all business logic client-side
- Use consistent ID patterns for Selenium
- Add `aria-` attributes for accessibility
- Include loading states on all async operations
- Store auth in sessionStorage (not localStorage)
- Make network delays visible to users
- Provide clear error messages with IDs
- Include data attributes for test assertions