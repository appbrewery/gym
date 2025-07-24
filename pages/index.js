import { useEffect } from 'react';
import { getDB } from '../lib/db';

export default function Home() {
  useEffect(() => {
    // Initialize database and make it available for console testing
    async function initDB() {
      try {
        const db = await getDB();
        window.db = db;
        console.log('Database initialized! Use window.db to interact with it.');
        console.log('Example commands:');
        console.log('  await window.db.getAll("users")');
        console.log('  await window.db.add("users", {id: "test1", email: "test@example.com", ...})');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
    initDB();
  }, []);

  return (
    <div>
      <h1>Gym Booking Simulator</h1>
      <p>Welcome to the Gym Booking Simulator - a testing playground for Selenium automation.</p>
      <p>Open your browser console to test the IndexedDB (available as window.db)</p>
    </div>
  )
}