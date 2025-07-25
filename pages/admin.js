import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth';
import { getDB } from '../lib/db';
import { updateNetworkSettings } from '../lib/network';
import { resetAllData, clearBookingsOnly } from '../lib/testData';
import { withNetworkSimulation } from '../lib/network';

export default function Admin() {
  const router = useRouter();
  const [networkSettings, setNetworkSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated or not admin
    const user = getCurrentUser();
    if (!user || user.membershipType !== 'admin') {
      router.push('/');
      return;
    }

    loadAdminData();
  }, [router]);

  const loadAdminData = async () => {
    try {
      const db = await getDB();
      
      // Load network settings
      const settings = await db.get('systemSettings', 'network_config');
      setNetworkSettings(settings || {
        enabled: true,
        minDelay: 500,
        maxDelay: 2000,
        failureRate: 0.1
      });

      // Load system statistics
      const users = await db.getAll('users');
      const classes = await db.getAll('classes');
      const bookings = await db.getAll('bookings');
      const waitlist = await db.getAll('waitlist');

      setStats({
        users: users.length,
        classes: classes.length,
        bookings: bookings.length,
        waitlist: waitlist.length,
        fullClasses: classes.filter(c => c.status === 'full').length
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Failed to load admin data');
      setLoading(false);
    }
  };

  const handleNetworkToggle = async () => {
    setUpdating(true);
    setError('');
    
    try {
      const updatedSettings = {
        ...networkSettings,
        enabled: !networkSettings.enabled
      };
      
      await updateNetworkSettings(updatedSettings);
      setNetworkSettings(updatedSettings);
    } catch (err) {
      setError('Failed to update network settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleNetworkSettingChange = async (field, value) => {
    setUpdating(true);
    setError('');
    
    try {
      const updatedSettings = {
        ...networkSettings,
        [field]: value
      };
      
      await updateNetworkSettings(updatedSettings);
      setNetworkSettings(updatedSettings);
    } catch (err) {
      setError('Failed to update network settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetAllData = async () => {
    if (!confirm('Are you sure you want to reset ALL data? This will delete all users, classes, and bookings except the default accounts.')) {
      return;
    }

    setResetting(true);
    setError('');
    
    try {
      await resetAllData();
      await loadAdminData();
    } catch (err) {
      setError('Failed to reset data');
    } finally {
      setResetting(false);
    }
  };

  const handleClearBookings = async () => {
    if (!confirm('Are you sure you want to clear all bookings and waitlists? Classes and users will remain.')) {
      return;
    }

    setResetting(true);
    setError('');
    
    try {
      await clearBookingsOnly();
      await loadAdminData();
    } catch (err) {
      setError('Failed to clear bookings');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div>Loading admin panel...</div>;
  }

  return (
    <div id="admin-page">
      <h1>Admin Panel</h1>
      
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

      {/* System Statistics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>System Statistics</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '1rem' 
        }}>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{stats?.users || 0}</h3>
            <p>Users</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{stats?.classes || 0}</h3>
            <p>Classes</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{stats?.bookings || 0}</h3>
            <p>Bookings</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{stats?.waitlist || 0}</h3>
            <p>Waitlist</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{stats?.fullClasses || 0}</h3>
            <p>Full Classes</p>
          </div>
        </div>
      </div>

      {/* Network Simulation Controls */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Network Simulation</h2>
        <div style={{ 
          padding: '1rem', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="network-enabled-toggle"
                type="checkbox"
                checked={networkSettings?.enabled || false}
                onChange={handleNetworkToggle}
                disabled={updating}
              />
              <strong>Enable Network Simulation</strong>
            </label>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.5rem 0 0 1.5rem' }}>
              {networkSettings?.enabled ? 'Network delays and failures are active' : 'All operations will be instant'}
            </p>
          </div>

          {networkSettings?.enabled && (
            <div style={{ marginLeft: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  <strong>Delay Range (ms)</strong>
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <label>Min:</label>
                    <input
                      type="number"
                      value={networkSettings.minDelay || 500}
                      onChange={(e) => handleNetworkSettingChange('minDelay', parseInt(e.target.value))}
                      min="0"
                      max="5000"
                      style={{ width: '80px', marginLeft: '0.5rem' }}
                      disabled={updating}
                    />
                  </div>
                  <div>
                    <label>Max:</label>
                    <input
                      type="number"
                      value={networkSettings.maxDelay || 2000}
                      onChange={(e) => handleNetworkSettingChange('maxDelay', parseInt(e.target.value))}
                      min="0"
                      max="10000"
                      style={{ width: '80px', marginLeft: '0.5rem' }}
                      disabled={updating}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  <strong>Failure Rate: {Math.round((networkSettings.failureRate || 0) * 100)}%</strong>
                </label>
                <input
                  id="failure-rate-slider"
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={networkSettings.failureRate || 0.1}
                  onChange={(e) => handleNetworkSettingChange('failureRate', parseFloat(e.target.value))}
                  style={{ width: '200px' }}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Data Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            id="reset-all-data-button"
            onClick={handleResetAllData}
            disabled={resetting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: resetting ? '#ccc' : '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: resetting ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {resetting ? 'Resetting...' : 'Reset All Data'}
          </button>
          
          <button
            id="clear-bookings-button"
            onClick={handleClearBookings}
            disabled={resetting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: resetting ? '#ccc' : '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: resetting ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {resetting ? 'Clearing...' : 'Clear Bookings Only'}
          </button>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
          Use these controls to reset test data during development and testing.
        </p>
      </div>
    </div>
  );
}