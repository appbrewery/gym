# Selenium Test Automation IDs and Data Attributes

This document provides a comprehensive reference for all Selenium-friendly IDs and data attributes available in the Gym Booking Simulator application.

## Navigation Component (`/src/components/Navigation/Navigation.js`)

### Element IDs
- `main-navigation` - Main navigation container
- `home-link` - Home page link
- `admin-panel-link` - Admin panel link (admin users only)
- `schedule-link` - Class schedule link (regular users)
- `my-bookings-link` - My bookings link (regular users)
- `user-info-section` - User information container
- `welcome-message` - Welcome message text
- `logout-button` - Logout button
- `login-button` - Login button (unauthenticated users)

### Data Attributes
- `data-user-name` - Current user's name
- `data-user-type` - User type (student/admin)
- `data-user-id` - Current user's ID

## Login Page (`/src/pages/login.js`)

### Element IDs
- `login-page` - Page container
- `test-credentials` - Test credentials section
- `login-form` - Main login/registration form
- `name-input` - Name input field (registration only)
- `email-input` - Email input field
- `password-input` - Password input field
- `error-message` - Error message display
- `submit-button` - Form submit button
- `toggle-login-register` - Toggle between login/register modes

### Data Attributes
- `data-form-mode` - Current form mode (login/register)
- `data-form-submitting` - Form submission state (true/false)

## Schedule Page (`/src/pages/schedule.js`)

### Element IDs
- `schedule-page` - Page container
- `error-message` - Error message display
- `type-filter` - Class type filter dropdown
- `day-filter` - Day filter dropdown
- `no-classes-message` - No results message
- `day-group-{day}` - Day group containers (e.g., `day-group-today`, `day-group-tomorrow`)
- `day-title-{day}` - Day title headers

### Data Attributes
- `data-selected-type` - Currently selected class type filter
- `data-selected-day` - Currently selected day filter
- `data-results-count` - Number of filtered results
- `data-loading` - Loading state

## ClassCard Component (`/src/components/ClassCard/ClassCard.js`)

### Element IDs
- `class-card-{classId}` - Individual class card containers
- `class-name-{classId}` - Class name heading
- `class-time-{classId}` - Class time display
- `class-availability-{classId}` - Availability info
- `book-button-{classId}` - Booking/action button
- `completed-label-{classId}` - Completed status label
- `class-error-{classId}` - Error message for specific class

### Data Attributes
- `data-class-id` - Class ID
- `data-class-type` - Class type (yoga/spin/hiit)
- `data-class-status` - Class status
- `data-available-spots` - Number of available spots
- `data-user-booked` - Whether current user has booked (true/false)
- `data-user-waitlisted` - Whether current user is waitlisted (true/false)
- `data-is-past-class` - Whether class is in the past (true/false)
- `data-is-fully-booked` - Whether class is fully booked (true/false)

## My Bookings Page (`/src/pages/my-bookings.js`)

### Element IDs
- `my-bookings-page` - Page container
- `error-message` - Error message display
- `empty-bookings-state` - Empty state message
- `confirmed-bookings-section` - Confirmed bookings section
- `confirmed-bookings-title` - Confirmed bookings title
- `waitlist-section` - Waitlist section
- `waitlist-title` - Waitlist title
- `booking-card-{bookingId}` - Individual booking cards
- `booking-class-name-{bookingId}` - Class name in booking card
- `cancel-booking-{bookingId}` - Cancel booking button
- `waitlist-card-{entryId}` - Individual waitlist cards
- `waitlist-class-name-{entryId}` - Class name in waitlist card
- `leave-waitlist-{entryId}` - Leave waitlist button

### Data Attributes
- `data-bookings-count` - Number of confirmed bookings
- `data-waitlist-count` - Number of waitlist entries
- `data-loading` - Loading state
- `data-booking-id` - Booking ID
- `data-class-type` - Class type
- `data-booking-status` - Booking status (confirmed/waitlisted)
- `data-waitlist-id` - Waitlist entry ID

## Admin Page (`/src/pages/admin.js`)

### Element IDs

#### Statistics Section
- `admin-page` - Page container
- `error-message` - Error message display
- `users-stat` - Users statistics card
- `classes-stat` - Classes statistics card
- `bookings-stat` - Bookings statistics card
- `waitlist-stat` - Waitlist statistics card
- `full-classes-stat` - Full classes statistics card

#### Network Simulation Controls
- `network-enabled-toggle` - Network simulation enable/disable checkbox
- `min-delay-input` - Minimum delay input
- `max-delay-input` - Maximum delay input
- `failure-rate-slider` - Failure rate slider

#### Time Simulation Controls
- `advance-1-hour` - Advance time by 1 hour button
- `advance-6-hours` - Advance time by 6 hours button
- `advance-1-day` - Advance time by 1 day button
- `advance-3-days` - Advance time by 3 days button
- `reset-time-button` - Reset time to real time button

#### Data Management
- `reset-all-data-button` - Reset all data button
- `clear-bookings-button` - Clear bookings only button

### Data Attributes
- `data-network-enabled` - Network simulation state (true/false)
- `data-time-offset` - Current time offset in milliseconds
- `data-loading` - Loading state

## Home Page (`/src/pages/index.js`)

### Element IDs
- `home-page` - Page container
- `yoga-info-card` - Yoga class information card
- `spin-info-card` - Spin class information card
- `hiit-info-card` - HIIT class information card
- `database-status-section` - Database status section
- `database-status-text` - Database status text

### Data Attributes
- `data-init-status` - Database initialization status

## Main App Container (`/src/pages/_app.js`)

### Element IDs
- `main-content` - Main content container

## Common Patterns

### Loading States
Many components include loading state indicators:
- Buttons show "Please wait...", "Booking...", "Cancelling..." etc.
- Loading states are reflected in `data-loading` attributes
- Disabled states during operations

### Error Handling
- `error-message` ID consistently used for error displays
- Error messages appear contextually near relevant actions

### User State
- Navigation shows different links based on user type
- `data-user-type` attribute indicates admin vs. student
- User-specific content is conditionally rendered

### Class-Specific Elements
- Many IDs include class ID for uniqueness: `{elementType}-{classId}`
- Data attributes provide class metadata for assertions

## Test Automation Examples

### Navigation Testing
```javascript
// Check if user is logged in
const userInfo = await driver.findElement(By.id('user-info-section'));
const userType = await userInfo.getAttribute('data-user-type');

// Navigate to schedule
await driver.findElement(By.id('schedule-link')).click();
```

### Booking Flow Testing
```javascript
// Find first available class
const classCard = await driver.findElement(By.css('[data-class-status="available"]'));
const classId = await classCard.getAttribute('data-class-id');

// Click book button
await driver.findElement(By.id(`book-button-${classId}`)).click();

// Verify booking success
const bookedCard = await driver.findElement(By.id(`class-card-${classId}`));
const isBooked = await bookedCard.getAttribute('data-user-booked');
assert.equal(isBooked, 'true');
```

### Admin Testing
```javascript
// Enable network simulation
await driver.findElement(By.id('network-enabled-toggle')).click();

// Set delay range
await driver.findElement(By.id('min-delay-input')).clear();
await driver.findElement(By.id('min-delay-input')).sendKeys('1000');

// Advance time
await driver.findElement(By.id('advance-1-day')).click();

// Check stats
const bookingsCount = await driver.findElement(By.id('bookings-stat')).getText();
```

### Form Testing
```javascript
// Switch to registration mode
await driver.findElement(By.id('toggle-login-register')).click();

// Fill registration form
await driver.findElement(By.id('name-input')).sendKeys('Test User');
await driver.findElement(By.id('email-input')).sendKeys('test@example.com');
await driver.findElement(By.id('password-input')).sendKeys('password123');

// Submit form
await driver.findElement(By.id('submit-button')).click();

// Check form state
const formMode = await driver.findElement(By.id('login-page')).getAttribute('data-form-mode');
const isSubmitting = await driver.findElement(By.id('login-page')).getAttribute('data-form-submitting');
```

This comprehensive ID and data attribute system enables thorough test automation coverage of all user flows, admin functions, and application states.