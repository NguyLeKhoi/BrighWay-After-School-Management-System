import React from 'react';
import styles from './FacilitiesAbout.module.css';

const FacilitiesAbout = () => {
  const features = [
    { icon: '●', title: 'Modern Classrooms', description: 'State-of-the-art learning environments' },
    { icon: '●', title: 'Advanced Technology', description: 'Latest equipment and software' },
    { icon: '●', title: 'Expert Instructors', description: 'Experienced and qualified teachers' },
    { icon: '●', title: 'Study Resources', description: 'Comprehensive learning materials' }
  ];

  return (
    <div className={styles.facilitiesAbout}>
      {/* Content Section 1 */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentWrapper}>
            <div className={styles.textContent}>
              <h1 className={styles.heading}>Our Facilities</h1>
              <h2 className={styles.subheading}>World-class learning environment</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.primaryButton}>Learn More</button>
                <button className={styles.secondaryButton}>View Gallery</button>
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
              <h1 className={styles.heading}>About Us</h1>
              <h2 className={styles.subheading}>Dedicated to excellence in education</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.primaryButton}>Our Story</button>
                <button className={styles.secondaryButton}>Meet the Team</button>
              </div>
            </div>
            <div className={styles.imageContent}>
              <div className={styles.imagePlaceholder}>Image</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section 3 */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.articleContent}>
            <h2 className={styles.sectionHeading}>Our Mission</h2>
            <article className={styles.article}>
              <p className={styles.articleText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className={styles.articleText}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Content Section 4 */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <h2 className={styles.sectionHeading}>Why Choose Us</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitiesAbout;
