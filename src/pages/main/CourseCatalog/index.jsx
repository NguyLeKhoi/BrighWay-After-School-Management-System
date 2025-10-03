import React from 'react';
import HeroSection from '@components/Common/HeroSection';
import Card from '@components/Common/Card';
import styles from './CourseCatalog.module.css';

const CourseCatalog = () => {
  const bestCourses = [
    {
      id: 1,
      title: 'React Mastery',
      description: 'Complete React course',
      infoRows: [
        { label: 'Age Group', value: '18+' },
        { label: 'Schedule', value: 'Mon, Wed, Fri - 19:00-21:00' },
        { label: 'Price', value: '2,500,000 VND' }
      ],
      actions: [
        { text: 'Register', primary: true, onClick: () => console.log('Register course:', 1) },
        { text: 'View Details', primary: false, onClick: () => console.log('View details:', 1) }
      ]
    },
    {
      id: 2,
      title: 'Python Basics',
      description: 'Learn Python programming',
      infoRows: [
        { label: 'Age Group', value: '16+' },
        { label: 'Schedule', value: 'Tue, Thu - 18:00-20:00' },
        { label: 'Price', value: '2,000,000 VND' }
      ],
      actions: [
        { text: 'Register', primary: true, onClick: () => console.log('Register course:', 2) },
        { text: 'View Details', primary: false, onClick: () => console.log('View details:', 2) }
      ]
    },
    {
      id: 3,
      title: 'UI/UX Design',
      description: 'Design beautiful interfaces',
      infoRows: [
        { label: 'Age Group', value: '18+' },
        { label: 'Schedule', value: 'Sat, Sun - 14:00-17:00' },
        { label: 'Price', value: '3,000,000 VND' }
      ],
      actions: [
        { text: 'Register', primary: true, onClick: () => console.log('Register course:', 3) },
        { text: 'View Details', primary: false, onClick: () => console.log('View details:', 3) }
      ]
    }
  ];

  return (
    <div className={styles.courseCatalog}>
      <HeroSection
        title="Course Catalog"
        subtitle="Discover our comprehensive learning programs"
        hasImage={true}
      />

      {/* Article Section */}
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
              <Card
                key={course.id}
                title={course.title}
                description={course.description}
                infoRows={course.infoRows}
                actions={course.actions}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseCatalog;
