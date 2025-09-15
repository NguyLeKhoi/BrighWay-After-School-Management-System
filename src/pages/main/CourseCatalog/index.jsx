import React from 'react';
import styles from './CourseCatalog.module.css';

const CourseCatalog = () => {
  const courses = [
    { id: 1, title: 'Web Development', description: 'Learn modern web technologies' },
    { id: 2, title: 'Data Science', description: 'Master data analysis and visualization' },
    { id: 3, title: 'Mobile App Development', description: 'Build iOS and Android apps' }
  ];

  const bestCourses = [
    { id: 1, title: 'React Mastery', description: 'Complete React course' },
    { id: 2, title: 'Python Basics', description: 'Learn Python programming' },
    { id: 3, title: 'UI/UX Design', description: 'Design beautiful interfaces' }
  ];

  return (
    <div className={styles.courseCatalog}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>Course Catalog</h1>
          <p className={styles.heroSubtitle}>Discover our comprehensive learning programs</p>
          <div className={styles.heroImage}>
            <div className={styles.imagePlaceholder}>Image</div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <article className={styles.article}>
            <p className={styles.articleText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            
            <div className={styles.cardGrid}>
              <div className={styles.card}>
                <div className={styles.cardPlaceholder}>Card</div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardPlaceholder}>Card</div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardPlaceholder}>Card</div>
              </div>
            </div>

            <p className={styles.articleText}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </article>
        </div>
      </section>

      {/* Best Courses Section */}
      <section className={styles.bestCoursesSection}>
        <div className={styles.bestCoursesContainer}>
          <h2 className={styles.sectionHeading}>Best courses</h2>
          <div className={styles.bestCoursesGrid}>
            {bestCourses.map((course) => (
              <div key={course.id} className={styles.bestCourseCard}>
                <div className={styles.cardPlaceholder}>Card</div>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.courseDescription}>{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseCatalog;
