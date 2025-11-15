import React from 'react';
import ContentSection from '@components/Common/ContentSection';
import InfoGrid from '@components/Common/InfoGrid';
import styles from './FacilitiesAbout.module.css';

const FacilitiesAbout = () => {
  const facilitiesSection = {
    heading: 'Our Facilities',
    subheading: 'World-class learning environment',
    buttons: [
      { text: 'Learn More', primary: true, onClick: () => {} },
      { text: 'View Gallery', primary: false, onClick: () => {} }
    ],
    hasImage: true
  };

  const aboutSection = {
    heading: 'About Us',
    subheading: 'Dedicated to excellence in education',
    buttons: [
      { text: 'Our Story', primary: true, onClick: () => {} },
      { text: 'Meet the Team', primary: false, onClick: () => {} }
    ],
    hasImage: true,
    reverse: true
  };

  const missionData = {
    heading: 'Our Mission',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    hasImage: false
  };

  const features = [
    { label: 'Modern Classrooms', value: 'State-of-the-art learning environments' },
    { label: 'Advanced Technology', value: 'Latest equipment and software' },
    { label: 'Expert Instructors', value: 'Experienced and qualified teachers' },
    { label: 'Study Resources', value: 'Comprehensive learning materials' }
  ];

  return (
    <div className={styles.facilitiesAbout}>
      <ContentSection {...facilitiesSection} />
      <ContentSection {...aboutSection} />
      <ContentSection {...missionData} />
      
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <h2 className={styles.sectionHeading}>Why Choose Us</h2>
          <InfoGrid items={features} columns={2} />
        </div>
      </section>
    </div>
  );
};

export default FacilitiesAbout;
