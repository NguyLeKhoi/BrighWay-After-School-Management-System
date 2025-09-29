import React from 'react';
import HeroSection from '@components/Common/HeroSection';
import ContentSection from '@components/Common/ContentSection';
import styles from './Homepage.module.css';

const Homepage = () => {
  const features = ['Quality Education', 'Expert Instructors', 'Modern Facilities'];

  const contentSection1 = {
    heading: 'Section heading',
    features: features,
    buttons: [
      { text: 'Learn More', primary: true, onClick: () => console.log('Learn More clicked') },
      { text: 'View Courses', primary: false, onClick: () => console.log('View Courses clicked') }
    ],
    hasImage: true
  };

  const contentSection2 = {
    heading: 'Why Choose Us',
    description: 'We provide comprehensive education programs designed to help you achieve your goals and build a successful career.',
    buttons: [
      { text: 'Our Programs', primary: true, onClick: () => console.log('Our Programs clicked') },
      { text: 'Apply Now', primary: false, onClick: () => console.log('Apply Now clicked') }
    ],
    hasImage: false
  };

  return (
    <div className={styles.homepage}>
      <HeroSection
        title="Landing page title"
        subtitle="Discover amazing educational opportunities and transform your future"
        buttonText="Get Started"
        onButtonClick={() => console.log('Get Started clicked')}
      />

      <ContentSection {...contentSection1} />

      <ContentSection {...contentSection2} />
    </div>
  );
};

export default Homepage;