import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser } from '../lib/auth';
import { getDB } from '../lib/db';
import ClassCard from '../components/ClassCard/ClassCard';
import { getDayLabel, isPast } from '../utils/dateHelpers';
import { getSimulatedTime, initializeTimeSimulation } from '../lib/timeSimulation';
import styles from './Schedule.module.css';

export default function Schedule() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDay, setSelectedDay] = useState('week');
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(getSimulatedTime());

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

    // Initialize time simulation first
    initializeTimeSimulation().then(() => {
      setCurrentTime(getSimulatedTime());
      loadClasses();
    });
    
    // Listen for storage changes (time simulation updates)
    const handleStorageChange = (e) => {
      if (e.key === 'time_simulation_offset') {
        setCurrentTime(getSimulatedTime());
        loadClasses();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also refresh when page becomes visible (returning from admin)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Re-initialize to catch any changes made in admin panel
        initializeTimeSimulation().then(() => {
          setCurrentTime(getSimulatedTime());
          loadClasses();
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle router navigation (e.g., back from admin)
    const handleRouteChange = () => {
      initializeTimeSimulation().then(() => {
        setCurrentTime(getSimulatedTime());
        loadClasses();
      });
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
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
    <div 
      id="schedule-page"
      className={styles.pageContainer}
      data-selected-type={selectedType}
      data-selected-day={selectedDay}
      data-results-count={filteredClasses.length}
      data-loading={loading}
    >
      <h1 className={styles.scheduleTitle}>
        Class Schedule (Today: {currentTime.toLocaleDateString()})
      </h1>
      
      {error && (
        <div id="error-message" className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {/* Filters */}
      <div className={styles.filters}>
        <select
          id="type-filter"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className={styles.filterSelect}
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
          className={styles.filterSelect}
        >
          <option value="week">Next 7 Days</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
        </select>
      </div>

      {/* Classes grouped by day */}
      {Object.keys(groupedClasses).length === 0 ? (
        <p id="no-classes-message" className={styles.noClasses}>No classes found matching your filters.</p>
      ) : (
        Object.entries(groupedClasses).map(([day, dayClasses]) => (
          <div 
            key={day} 
            id={`day-group-${day.replace(/\s+/g, '-').toLowerCase()}`}
            className={styles.dayGroup}
          >
            <h2 
              id={`day-title-${day.replace(/\s+/g, '-').toLowerCase()}`}
              className={styles.dayTitle}
            >
              {day}
            </h2>
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