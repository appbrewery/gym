import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/auth";
import { getDB } from "../lib/db";
import { updateNetworkSettings } from "../lib/network";
import { resetAllData, clearBookingsOnly } from "../lib/testData";
import { withNetworkSimulation } from "../lib/network";
import {
  getTimeOffset,
  advanceTime,
  resetTime,
  formatTimeOffset,
  initializeTimeSimulation,
} from "../lib/timeSimulation";
import styles from "./Admin.module.css";

export default function Admin() {
  const router = useRouter();
  const [networkSettings, setNetworkSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [timeOffset, setTimeOffset] = useState(0);
  const [adjustingTime, setAdjustingTime] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated or not admin
    const user = getCurrentUser();
    if (!user || user.membershipType !== "admin") {
      router.push("/");
      return;
    }

    loadAdminData();
    initializeTimeSimulation();
  }, [router]);

  const loadAdminData = async () => {
    try {
      const db = await getDB();

      // Load network settings
      const settings = await db.get("systemSettings", "network_config");
      setNetworkSettings(
        settings || {
          enabled: false, // Disabled by default
          minDelay: 500,
          maxDelay: 2000,
          failureRate: 0.1,
        }
      );

      // Load system statistics
      const users = await db.getAll("users");
      const classes = await db.getAll("classes");
      const bookings = await db.getAll("bookings");
      const waitlist = await db.getAll("waitlist");

      setStats({
        users: users.length,
        classes: classes.length,
        bookings: bookings.length,
        waitlist: waitlist.length,
        fullClasses: classes.filter((c) => c.status === "full").length,
      });

      // Load time offset
      setTimeOffset(getTimeOffset());

      setLoading(false);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Failed to load admin data");
      setLoading(false);
    }
  };

  const handleNetworkToggle = async () => {
    setUpdating(true);
    setError("");

    try {
      const updatedSettings = {
        ...networkSettings,
        enabled: !networkSettings.enabled,
      };

      await updateNetworkSettings(updatedSettings);
      setNetworkSettings(updatedSettings);
    } catch (err) {
      setError("Failed to update network settings");
    } finally {
      setUpdating(false);
    }
  };

  const handleNetworkSettingChange = async (field, value) => {
    setUpdating(true);
    setError("");

    try {
      const updatedSettings = {
        ...networkSettings,
        [field]: value,
      };

      await updateNetworkSettings(updatedSettings);
      setNetworkSettings(updatedSettings);
    } catch (err) {
      setError("Failed to update network settings");
    } finally {
      setUpdating(false);
    }
  };

  const handleResetAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to reset ALL data? This will delete all users, classes, and bookings except the default accounts."
      )
    ) {
      return;
    }

    setResetting(true);
    setError("");

    try {
      await resetAllData();
      await loadAdminData();
    } catch (err) {
      setError("Failed to reset data");
    } finally {
      setResetting(false);
    }
  };

  const handleClearBookings = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all bookings and waitlists? Classes and users will remain."
      )
    ) {
      return;
    }

    setResetting(true);
    setError("");

    try {
      await clearBookingsOnly();
      await loadAdminData();
    } catch (err) {
      setError("Failed to clear bookings");
    } finally {
      setResetting(false);
    }
  };

  const handleAdvanceTime = async (amount, unit) => {
    setAdjustingTime(true);
    setError("");

    try {
      const newOffset = await advanceTime(amount, unit);
      setTimeOffset(newOffset);
      // Refresh stats as class statuses may have changed
      await loadAdminData();
    } catch (err) {
      setError("Failed to advance time");
    } finally {
      setAdjustingTime(false);
    }
  };

  const handleResetTime = async () => {
    setAdjustingTime(true);
    setError("");

    try {
      await resetTime();
      setTimeOffset(0);
      await loadAdminData();
    } catch (err) {
      setError("Failed to reset time");
    } finally {
      setAdjustingTime(false);
    }
  };

  if (loading) {
    return <div>Loading admin panel...</div>;
  }

  return (
    <div
      id="admin-page"
      className={styles.pageContainer}
      data-network-enabled={networkSettings?.enabled || false}
      data-time-offset={timeOffset}
      data-loading={loading}
    >
      <h1 className={styles.pageTitle}>Admin Panel</h1>

      {error && (
        <div id="error-message" className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* System Statistics */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>System Statistics</h2>
        <div className={styles.statsGrid}>
          <div id="users-stat" className={styles.statCard}>
            <h3>{stats?.users || 0}</h3>
            <p>Users</p>
          </div>
          <div id="classes-stat" className={styles.statCard}>
            <h3>{stats?.classes || 0}</h3>
            <p>Classes</p>
          </div>
          <div id="bookings-stat" className={styles.statCard}>
            <h3>{stats?.bookings || 0}</h3>
            <p>Bookings</p>
          </div>
          <div id="waitlist-stat" className={styles.statCard}>
            <h3>{stats?.waitlist || 0}</h3>
            <p>Waitlist</p>
          </div>
          <div id="full-classes-stat" className={styles.statCard}>
            <h3>{stats?.fullClasses || 0}</h3>
            <p>Full Classes</p>
          </div>
        </div>
      </div>

      {/* Network Simulation Controls */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Network Simulation</h2>
        <div className={styles.controlPanel}>
          <div className={styles.controlGroup}>
            <label className={styles.checkbox}>
              <input
                id="network-enabled-toggle"
                type="checkbox"
                checked={networkSettings?.enabled || false}
                onChange={handleNetworkToggle}
                disabled={updating}
              />
              <strong>Enable Network Simulation</strong>
            </label>
            <p className={styles.checkboxDescription}>
              {networkSettings?.enabled
                ? "Network delays and failures are active"
                : "All operations will be instant"}
            </p>
          </div>

          {networkSettings?.enabled && (
            <div className={styles.nestedControls}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <strong>Delay Range (ms)</strong>
                </label>
                <div className={styles.inputGroup}>
                  <div>
                    <label>Min:</label>
                    <input
                      id="min-delay-input"
                      type="number"
                      value={networkSettings.minDelay || 500}
                      onChange={(e) =>
                        handleNetworkSettingChange(
                          "minDelay",
                          parseInt(e.target.value)
                        )
                      }
                      min="0"
                      max="5000"
                      className={styles.numberInput}
                      disabled={updating}
                    />
                  </div>
                  <div>
                    <label>Max:</label>
                    <input
                      id="max-delay-input"
                      type="number"
                      value={networkSettings.maxDelay || 2000}
                      onChange={(e) =>
                        handleNetworkSettingChange(
                          "maxDelay",
                          parseInt(e.target.value)
                        )
                      }
                      min="0"
                      max="10000"
                      className={styles.numberInput}
                      disabled={updating}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={styles.label}>
                  <strong>
                    Failure Rate:{" "}
                    {Math.round((networkSettings.failureRate || 0) * 100)}%
                  </strong>
                </label>
                <input
                  id="failure-rate-slider"
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={networkSettings.failureRate || 0.0}
                  onChange={(e) =>
                    handleNetworkSettingChange(
                      "failureRate",
                      parseFloat(e.target.value)
                    )
                  }
                  className={styles.slider}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Simulation */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Time Simulation</h2>
        <div className={styles.controlPanel}>
          <div className={styles.timeStatus}>
            <strong>Current Time Status:</strong>
            <p
              className={`${styles.timeStatusValue} ${
                timeOffset === 0 ? styles.realTime : styles.simulated
              }`}
            >
              {formatTimeOffset(timeOffset)}
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <button
              id="advance-1-hour"
              onClick={() => handleAdvanceTime(1, "hours")}
              disabled={adjustingTime}
              className={`${styles.button} ${styles.primary}`}
            >
              +1 Hour
            </button>
            <button
              id="advance-6-hours"
              onClick={() => handleAdvanceTime(6, "hours")}
              disabled={adjustingTime}
              className={`${styles.button} ${styles.primary}`}
            >
              +6 Hours
            </button>
            <button
              id="advance-1-day"
              onClick={() => handleAdvanceTime(1, "days")}
              disabled={adjustingTime}
              className={`${styles.button} ${styles.secondary}`}
            >
              +1 Day
            </button>
            <button
              id="advance-3-days"
              onClick={() => handleAdvanceTime(3, "days")}
              disabled={adjustingTime}
              className={`${styles.button} ${styles.secondary}`}
            >
              +3 Days
            </button>
            <button
              id="reset-time-button"
              onClick={handleResetTime}
              disabled={adjustingTime}
              className={`${styles.button} ${styles.danger}`}
            >
              Reset to Real Time
            </button>
          </div>

          <p className={styles.helpText}>
            Time simulation affects class scheduling, "Today/Tomorrow" labels,
            and past class filtering. Classes that become "past" due to time
            advancement will be hidden from the schedule.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Management</h2>
        <div className={styles.buttonGroup}>
          <button
            id="reset-all-data-button"
            onClick={handleResetAllData}
            disabled={resetting}
            className={`${styles.button} ${styles.danger} ${styles.large}`}
          >
            {resetting ? "Resetting..." : "Reset All Data"}
          </button>

          <button
            id="clear-bookings-button"
            onClick={handleClearBookings}
            disabled={resetting}
            className={`${styles.button} ${styles.warning} ${styles.large}`}
          >
            {resetting ? "Clearing..." : "Clear Bookings Only"}
          </button>
        </div>
        <p className={styles.helpText}>
          Use these controls to reset test data during development and testing.
        </p>
      </div>
    </div>
  );
}
