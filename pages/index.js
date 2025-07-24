import { useEffect, useState } from 'react';
import { getDB } from '../lib/db';
import { initializeTestData } from '../lib/testData';

export default function Home() {
  const [initStatus, setInitStatus] = useState('Initializing...');

  useEffect(() => {
    let isActive = true;
    
    // Initialize database and test data
    async function init() {
      // Skip if already initialized
      if (window.db) {
        setInitStatus('Ready');
        return;
      }
      
      try {
        const db = await getDB();
        window.db = db;
        
        // Initialize test data
        const result = await initializeTestData();
        window.testData = { initializeTestData, resetAllData: async () => (await import('../lib/testData')).resetAllData() };
        
        if (!isActive) return;
        
        // Debug: Check what was actually created
        const users = await db.getAll('users');
        const classes = await db.getAll('classes');
        const bookings = await db.getAll('bookings');
        
        console.log('Data initialization result:', result);
        console.log('Users in DB:', users.length, users);
        console.log('Classes in DB:', classes.length);
        console.log('Bookings in DB:', bookings.length, bookings);
        
        setInitStatus('Ready');
        console.log('Database initialized! Available commands:');
        console.log('  await window.db.getAll("users")');
        console.log('  await window.db.getAll("classes")');
        console.log('  await window.db.getAll("bookings")');
        console.log('  await window.testData.resetAllData() - Reset all data');
      } catch (error) {
        console.error('Failed to initialize:', error);
        if (isActive) setInitStatus('Error');
      }
    }
    init();
    
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div>
      <h1>Gym Booking Simulator</h1>
      <p>Welcome to the Gym Booking Simulator - a testing playground for Selenium automation.</p>
      <p>Status: {initStatus}</p>
      <p>Open your browser console to test the database and view the test data.</p>
    </div>
  )
}