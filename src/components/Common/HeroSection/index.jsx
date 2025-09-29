import React from 'react';
import styles from './HeroSection.module.css';

const HeroSection = ({ 
  title, 
  subtitle, 
  buttonText, 
  onButtonClick, 
  hasImage = true,
  imageContent 
}) => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <h1 className={styles.heroTitle}>{title}</h1>
        {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
        {buttonText && (
          <button className={styles.heroButton} onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
        {hasImage && (
          <div className={styles.heroImage}>
            {imageContent || <div className={styles.imagePlaceholder}>Image</div>}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

