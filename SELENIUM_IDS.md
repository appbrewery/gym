# Selenium Testing Guide

This document provides general guidance for automated testing of the Snack & Lift gym booking application. The application includes various elements designed to support test automation.

## General Testing Approach

The application uses consistent ID patterns and data attributes to support automated testing. Elements are designed to be stable and predictable for reliable test automation.

### Element Identification Patterns

The application follows these general patterns for element identification:

- **Page containers**: Each page has a main container element
- **Form elements**: Input fields, buttons, and form containers have descriptive IDs
- **Interactive elements**: Buttons and links have consistent ID patterns
- **Dynamic content**: Elements that change based on data include relevant data attributes
- **Error messages**: Error displays have consistent identification patterns

### Data Attributes

The application includes data attributes that provide additional context for testing:

- **User state**: Information about the current user and their permissions
- **Content state**: Status information about classes, bookings, and other dynamic content
- **Loading states**: Indicators for ongoing operations
- **Form states**: Information about form modes and submission status

## Key Testing Areas

### Authentication Flow
- Login and registration forms
- Session management
- User state transitions
- Error handling for invalid credentials

### Class Schedule
- Class listing and filtering
- Class availability information
- Interactive booking elements
- Past/future class distinctions

### Booking Management
- Booking confirmation process
- Booking cancellation
- Waitlist functionality
- User booking history

### Admin Functions
- Network simulation controls
- Time manipulation features
- Data management tools
- System statistics

## Testing Strategies

### Element Selection
Use browser developer tools to inspect elements and identify appropriate selectors. The application uses:
- ID attributes for unique elements
- Data attributes for element state information
- CSS classes for styling and some functional states

### Waiting for Elements
The application includes loading states and network simulation. Tests should:
- Wait for loading states to complete
- Handle network delays appropriately
- Check for element availability before interaction

### State Verification
Use data attributes and element states to verify application behavior:
- Check user authentication status
- Verify booking confirmations
- Confirm class availability updates
- Validate error message displays

### Error Handling
Test error scenarios including:
- Network failures (when simulation is enabled)
- Validation errors
- Booking conflicts
- Authentication failures

## Development Hints

### Inspection Tools
Use browser developer tools to:
- Examine element structures
- Identify available IDs and data attributes
- Monitor network requests and responses
- Debug element interactions

### Test Data Management
The admin panel provides tools for:
- Resetting application state
- Clearing booking data
- Advancing system time
- Configuring network conditions

Remember: This is a learning exercise. Part of the challenge is discovering how to interact with the application through exploration and inspection of the user interface elements.

---

*Good luck with your automation journey! Remember, at Snack & Lift, even our tests believe in taking breaks when needed.*