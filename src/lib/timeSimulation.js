import { getDB } from './db';

const TIME_OFFSET_KEY = 'time_simulation_offset';

// Get the current simulated time
export function getSimulatedTime() {
  if (typeof window === 'undefined') return new Date(); // Server-side fallback
  
  const offset = parseInt(localStorage.getItem(TIME_OFFSET_KEY) || '0');
  return new Date(Date.now() + offset);
}

// Get the time offset in milliseconds
export function getTimeOffset() {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(TIME_OFFSET_KEY) || '0');
}

// Set the time offset
export function setTimeOffset(offsetMs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIME_OFFSET_KEY, offsetMs.toString());
}

// Advance time by specified amount
export async function advanceTime(amount, unit = 'hours') {
  const multipliers = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000
  };
  
  const additionalOffset = amount * multipliers[unit];
  const currentOffset = getTimeOffset();
  const newOffset = currentOffset + additionalOffset;
  
  setTimeOffset(newOffset);
  
  // Update system settings in database
  const db = await getDB();
  await db.update('systemSettings', {
    id: 'time_simulation',
    offsetMs: newOffset,
    lastUpdated: new Date().toISOString()
  });
  
  return newOffset;
}

// Reset time to current real time
export async function resetTime() {
  setTimeOffset(0);
  
  // Update system settings in database
  const db = await getDB();
  await db.update('systemSettings', {
    id: 'time_simulation',
    offsetMs: 0,
    lastUpdated: new Date().toISOString()
  });
}

// Initialize time simulation from database
export async function initializeTimeSimulation() {
  try {
    const db = await getDB();
    const timeSettings = await db.get('systemSettings', 'time_simulation');
    
    if (timeSettings && timeSettings.offsetMs) {
      setTimeOffset(timeSettings.offsetMs);
    }
  } catch (error) {
    console.error('Failed to initialize time simulation:', error);
  }
}

// Format the time offset for display
export function formatTimeOffset(offsetMs) {
  if (offsetMs === 0) return 'Real time';
  
  const totalMinutes = Math.floor(Math.abs(offsetMs) / (60 * 1000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  
  const direction = offsetMs > 0 ? 'ahead' : 'behind';
  return `${parts.join(', ')} ${direction}`;
}