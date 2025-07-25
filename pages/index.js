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
    <div id="home-page">
      <h1>Welcome to FitHub Gym</h1>
      <p>Book your favorite fitness classes online - Yoga, Spin, and HIIT!</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Available Classes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3 style={{ color: '#8B5CF6' }}>Yoga</h3>
            <p>60 minutes • 20 spots</p>
            <p>Find your inner peace and flexibility</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3 style={{ color: '#3B82F6' }}>Spin</h3>
            <p>45 minutes • 10 spots</p>
            <p>High-energy cycling workout</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3 style={{ color: '#EF4444' }}>HIIT</h3>
            <p>30 minutes • 15 spots</p>
            <p>Maximum results in minimum time</p>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          Database Status: {initStatus}
        </p>
      </div>
    </div>
  )
}