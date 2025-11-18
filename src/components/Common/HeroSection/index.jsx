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
            {imageContent || (
              <img 
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=80" 
                alt={title || "Hero image"}
                className={styles.heroImageImg}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

