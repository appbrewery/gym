# Snack & Lift - Gym Class Booking System

Welcome to **Snack & Lift**. This is a web application for practicing booking fitness classes (Yoga, Spin, and HIIT).

> *"Lift Weights. Eat Snacks. Repeat."*
> *"Where Gains and Grazing Coexist."*

## About the Application

Snack & Lift is a client-side gym booking system built for testing and demonstration purposes. The application simulates a real gym booking experience with authentication, class scheduling, booking management, and network delays - all running entirely in your browser using IndexedDB for data persistence.

## Getting Started

### Installation & Setup (local)

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will automatically initialize with sample data when you first visit.

### Test Accounts

The system comes pre-configured with test accounts for different user types:

#### Student Account
- **Email**: `student@test.com`
- **Password**: `password123`
- **Access**: Can book classes, view bookings, join waitlists

#### Admin Account
- **Email**: `admin@test.com`
- **Password**: `admin123`
- **Access**: Full admin panel with network simulation and data management controls

You can also register new accounts through the registration form.

## Features

### For Students
- **Browse Classes**: View available Yoga, Spin, and HIIT classes
- **Book Classes**: Reserve spots in upcoming classes
- **Manage Bookings**: View confirmed bookings and cancel if needed
- **Waitlist System**: Join waitlists for full classes
- **Network Simulation**: Experience realistic network delays and occasional failures

### For Administrators
- **System Statistics**: View user counts, class capacity, and booking metrics
- **Network Simulation Controls**: Toggle network delays and failure rates
- **Time Simulation**: Advance system time to test different scenarios
- **Data Management**: Reset all data or clear bookings only

## Class Types

The gym offers three types of classes:

- **Yoga** (60 minutes, 20 spots): Find your inner peace and flexibility... or just nap in child's pose
- **Spin** (45 minutes, 10 spots): Go nowhere fast, but with great music  
- **HIIT** (30 minutes, 15 spots): Maximum results in minimum time (snack break included)

## Technical Architecture

### Database Schema
The application uses IndexedDB for client-side data persistence with the following stores:

- **users**: User accounts and profiles
- **classes**: Class schedules and capacity information
- **bookings**: Confirmed class reservations
- **waitlist**: Waitlist entries for full classes
- **systemSettings**: Network simulation and admin configurations

### Test Data Generation
The system automatically generates:
- 3 weeks of classes (1 week past, 2 weeks future)
- 6 daily time slots: 7AM, 8AM, 9AM, 5PM, 6PM, 7PM
- Varied booking levels (some available, some full, some with waitlists)
- Past classes marked as completed

### Network Simulation
The admin panel allows configuration of realistic network conditions:
- Configurable delay ranges (500ms - 2000ms default)
- Adjustable failure rates (0-50%)
- Toggle between instant and simulated network responses

## Development & Testing

### Technology Stack
- **Next.js** - React framework with static site generation
- **React** - Component-based UI library
- **IndexedDB** - Client-side data persistence
- **CSS Modules** - Scoped styling
- **No backend required** - Fully client-side application

### Testing Considerations
The application includes consistent element IDs and data attributes to support automated testing. Key areas to focus on include:

1. **Authentication Flow**: Login/logout functionality
2. **Class Browsing**: Schedule viewing and filtering
3. **Booking Operations**: Successful bookings and error handling
4. **Waitlist Management**: Joining and leaving waitlists
5. **Network Error Handling**: Resilience during simulated failures
6. **Admin Functions**: Data management and system configuration

### Admin Panel Features

The admin panel (`/admin`) provides powerful testing and demonstration tools:

- **Network Simulation**: Enable/disable delays and failures
- **Time Controls**: Advance system time to test different scenarios
- **Data Reset**: Clear all bookings or reset entire system
- **System Statistics**: Monitor application usage and state

## File Structure

```
src/
├── components/
│   ├── ClassCard/          # Individual class display
│   └── Navigation/         # Site navigation
├── lib/
│   ├── auth.js            # Authentication logic
│   ├── classUtils.js      # Class management utilities
│   ├── db.js              # IndexedDB wrapper
│   ├── network.js         # Network simulation
│   ├── testData.js        # Sample data generation
│   └── timeSimulation.js  # Time advancement features
├── pages/
│   ├── admin.js           # Admin control panel
│   ├── index.js           # Landing page
│   ├── login.js           # Authentication
│   ├── my-bookings.js     # User booking management
│   └── schedule.js        # Class schedule
├── styles/
│   ├── globals.css        # Global styles
│   └── variables.css      # CSS custom properties
└── utils/
    └── dateHelpers.js     # Date formatting utilities
```

## Contributing

This is a demonstration application designed for educational purposes. Feel free to explore the code, test different scenarios, and understand how a modern web application handles complex user interactions with simulated real-world conditions.

---

*Remember: At Snack & Lift, we believe the best workout is the one you actually show up for... eventually.*