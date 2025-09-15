import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Homepage.module.css';

const Homepage = () => {
  const features = [
    { title: 'Quality Education', description: 'World-class learning programs' },
    { title: 'Expert Instructors', description: 'Experienced and qualified teachers' },
    { title: 'Modern Facilities', description: 'State-of-the-art learning environment' }
  ];

  return (
    <div className={styles.homepage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>Landing page title</h1>
          <p className={styles.heroSubtitle}>Discover amazing educational opportunities and transform your future</p>
          <button className={styles.heroButton}>Get Started</button>
          <div className={styles.heroImage}>
            <div className={styles.imagePlaceholder}>Image</div>
          </div>
        </div>
      </section>

      {/* Content Section 1 */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentWrapper}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionHeading}>Section heading</h2>
              <div className={styles.featuresList}>
                <h3 className={styles.featureTitle}>Quality Education</h3>
                <h3 className={styles.featureTitle}>Expert Instructors</h3>
                <h3 className={styles.featureTitle}>Modern Facilities</h3>
              </div>
              <div className={styles.buttonGroup}>
                <button className={styles.primaryButton}>Learn More</button>
                <button className={styles.secondaryButton}>View Courses</button>
              </div>
            </div>
            <div className={styles.imageContent}>
              <div className={styles.imagePlaceholder}>Image</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section 2 */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentWrapper}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionHeading}>Why Choose Us</h2>
              <p className={styles.sectionDescription}>
                We provide comprehensive education programs designed to help you achieve your goals and build a successful career.
              </p>
              <div className={styles.buttonGroup}>
                <button className={styles.primaryButton}>Our Programs</button>
                <button className={styles.secondaryButton}>Apply Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;