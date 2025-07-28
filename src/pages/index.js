import { useEffect, useState } from "react";
import Link from "next/link";
import { getDB } from "../lib/db";
import { initializeTestData } from "../lib/testData";
import { initializeTimeSimulation } from "../lib/timeSimulation";
import styles from "./Home.module.css";

export default function Home() {
  const [initStatus, setInitStatus] = useState("Initializing...");

  useEffect(() => {
    let isActive = true;

    // Initialize database and test data
    async function init() {
      // Skip if already initialized
      if (window.db) {
        setInitStatus("Ready");
        return;
      }

      try {
        const db = await getDB();
        window.db = db;

        // Initialize time simulation
        await initializeTimeSimulation();

        // Initialize test data
        const result = await initializeTestData();
        window.testData = {
          initializeTestData,
          resetAllData: async () =>
            (await import("../lib/testData")).resetAllData(),
        };

        if (!isActive) return;

        // Debug: Check what was actually created
        const users = await db.getAll("users");
        const classes = await db.getAll("classes");
        const bookings = await db.getAll("bookings");

        console.log("Data initialization result:", result);
        console.log("Users in DB:", users.length, users);
        console.log("Classes in DB:", classes.length);
        console.log("Bookings in DB:", bookings.length, bookings);

        setInitStatus("Ready");
        console.log("Database initialized! Available commands:");
        console.log('  await window.db.getAll("users")');
        console.log('  await window.db.getAll("classes")');
        console.log('  await window.db.getAll("bookings")');
        console.log("  await window.testData.resetAllData() - Reset all data");
      } catch (error) {
        console.error("Failed to initialize:", error);
        if (isActive) setInitStatus("Error");
      }
    }
    init();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div
      id="home-page"
      className={styles.homeContainer}
      data-init-status={initStatus}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Snack & Lift</h1>
          <p className={styles.heroTagline}>
            Lift Weights 💪. Eat Snacks. 🍿🍉🍩 Repeat.
          </p>
          <p className={styles.heroSubtagline}>
            Where Gains and Grazing Coexist.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/login">
              <button className={styles.heroButton}>
                Join Today... Or Tomorrow
              </button>
            </Link>
            <Link href="#about">
              <button className={styles.heroButtonSecondary}>Learn More</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Available Classes Section */}
      <section className={styles.classesSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Available Classes</h2>
          <p className={styles.sectionSubtitle}>
            Warning: May contain traces of actual exercise
          </p>
          <div className={styles.classGrid}>
            <div
              id="yoga-info-card"
              className={`${styles.classCard} ${styles.yoga}`}
            >
              <img
                src="/yoga-ginny-rose-stewart-UxkcSzRWM2s-unsplash-min.jpg"
                alt="Yoga"
                className={styles.classImage}
              />
              <div className={styles.classContent}>
                <h3>Yoga</h3>
                <p className={styles.classDuration}>60 minutes • 20 spots</p>
                <p className={styles.classDescription}>
                  Find your inner peace and flexibility... or just nap in
                  child's pose
                </p>
              </div>
            </div>
            <div
              id="spin-info-card"
              className={`${styles.classCard} ${styles.spin}`}
            >
              <img
                src="/spin-trust-tru-katsande-A_ftsTh53lM-unsplash-min.jpg"
                alt="Spin"
                className={styles.classImage}
              />
              <div className={styles.classContent}>
                <h3>Spin</h3>
                <p className={styles.classDuration}>45 minutes • 10 spots</p>
                <p className={styles.classDescription}>
                  Go nowhere fast, but with great music
                </p>
              </div>
            </div>
            <div
              id="hiit-info-card"
              className={`${styles.classCard} ${styles.hiit}`}
            >
              <img
                src="/HIIT-karsten-winegeart-0Wra5YYVQJE-unsplash-min.jpg"
                alt="HIIT"
                className={styles.classImage}
              />
              <div className={styles.classContent}>
                <h3>HIIT</h3>
                <p className={styles.classDuration}>30 minutes • 15 spots</p>
                <p className={styles.classDescription}>
                  Maximum results in minimum time (snack break included)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>About Snack & Lift</h2>
          <div className={styles.aboutContent}>
            <p className={styles.aboutText}>
              Welcome to Snack & Lift—the gym for people who love fitness… in
              theory. We cater to busy procrastinators, snack enthusiasts, and
              those who believe "cheat day" is a lifestyle. Our state-of-the-art
              facility features top-notch equipment (and a well-stocked vending
              machine) because we know gains require fuel. 🍰
            </p>
            <p className={styles.aboutText}>
              Whether you're here to Bench Pressed for Time™ or just to admire
              yourself in the mirror, we promise a no-pressure
              environment—unless you hog the dumbbells.
            </p>
            <div className={styles.perksList}>
              <h3>Membership perks include:</h3>
              <ul>
                <li>24/7 access* (*but closed on weekends for staff morale)</li>
                <li>Complimentary protein bar samples (while supplies last)</li>
                <li>Judgement-free zone (except for skipping warm-ups)</li>
              </ul>
            </div>
            <p className={styles.aboutCta}>
              Join today—or tomorrow. We'll be here…
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>What Our Members Say</h2>
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <p className={styles.testimonialQuote}>
                "The vending machine is closer than the treadmill. Perfect."
              </p>
              <p className={styles.testimonialAuthor}>
                – Karen, Snack-Based Dietitian
              </p>
            </div>
            <div className={styles.testimonialCard}>
              <p className={styles.testimonialQuote}>
                "I thought it was a bakery. Stayed for the squats."
              </p>
              <p className={styles.testimonialAuthor}>
                – Dave, Confused but Committed
              </p>
            </div>
          </div>
        </div>
      </section>

      <div id="database-status-section" className={styles.statusSection}>
        <div className={styles.sectionContainer}>
          <p id="database-status-text" className={styles.statusText}>
            Database Status: {initStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
