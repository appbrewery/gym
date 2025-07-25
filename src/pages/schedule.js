import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser } from '../lib/auth';
import { getDB } from '../lib/db';
import ClassCard from '../components/ClassCard/ClassCard';
import { getDayLabel, isPast } from '../utils/dateHelpers';
import { getSimulatedTime } from '../lib/timeSimulation';

export default function Schedule() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Redirect admin users to admin panel
    const user = getCurrentUser();
    if (user && user.membershipType === 'admin') {
      router.push('/admin');
      return;
    }

    loadClasses();
  }, [router]);

  useEffect(() => {
    filterClasses();
  }, [classes, selectedType, selectedDay]);

  const loadClasses = async () => {
    try {
      const db = await getDB();
      const allClasses = await db.getAll('classes');
      
      // Sort by date/time
      allClasses.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      
      setClasses(allClasses);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load classes:', err);
      setError('Failed to load classes. Please refresh the page.');
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = [...classes];

    // Always filter out past classes
    filtered = filtered.filter(c => !isPast(c.dateTime));

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === selectedType);
    }

    // Filter by day
    if (selectedDay !== 'all') {
      const today = getSimulatedTime(); // Use simulated time instead of real time
      today.setHours(0, 0, 0, 0);
      
      let targetDate = new Date(today);
      if (selectedDay === 'today') {
        // Today
      } else if (selectedDay === 'tomorrow') {
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (selectedDay === 'week') {
        // Next 7 days
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filtered = filtered.filter(c => {
          const classDate = new Date(c.dateTime);
          return classDate >= today && classDate <= weekFromNow;
        });
      }
      
      if (selectedDay === 'today' || selectedDay === 'tomorrow') {
        filtered = filtered.filter(c => {
          const classDate = new Date(c.dateTime);
          return classDate.toDateString() === targetDate.toDateString();
        });
      }
    }

    setFilteredClasses(filtered);
  };

  // Group classes by day
  const groupedClasses = filteredClasses.reduce((groups, classItem) => {
    const dayLabel = getDayLabel(classItem.dateTime);
    if (!groups[dayLabel]) {
      groups[dayLabel] = [];
    }
    groups[dayLabel].push(classItem);
    return groups;
  }, {});

  if (loading) {
    return <div>Loading classes...</div>;
  }

  return (
    <div id="schedule-page">
      <h1>Class Schedule</h1>
      
      {error && (
        <div id="error-message" style={{ 
          color: 'red', 
          marginBottom: '1rem',
          padding: '0.5rem',
          border: '1px solid red',
          borderRadius: '4px',
          backgroundColor: '#fef2f2'
        }}>
          {error}
        </div>
      )}
      
      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <select
          id="type-filter"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="all">All Classes</option>
          <option value="yoga">Yoga</option>
          <option value="spin">Spin</option>
          <option value="hiit">HIIT</option>
        </select>

        <select
          id="day-filter"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="all">All Days</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="week">Next 7 Days</option>
        </select>
      </div>

      {/* Classes grouped by day */}
      {Object.keys(groupedClasses).length === 0 ? (
        <p>No classes found matching your filters.</p>
      ) : (
        Object.entries(groupedClasses).map(([day, dayClasses]) => (
          <div key={day} style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>{day}</h2>
            {dayClasses.map(classItem => (
              <ClassCard
                key={classItem.id}
                classData={classItem}
                onBookingChange={loadClasses}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}