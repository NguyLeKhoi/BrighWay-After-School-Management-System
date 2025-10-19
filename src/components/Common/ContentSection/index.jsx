import React from 'react';
import styles from './ContentSection.module.css';

const ContentSection = ({ 
  heading, 
  subheading, 
  description, 
  features, 
  buttons, 
  hasImage = true,
  reverse = false,
  imageContent 
}) => {
  return (
    <section className={styles.contentSection}>
      <div className={styles.contentContainer}>
        <div className={`${styles.contentWrapper} ${reverse ? styles.reverse : ''}`}>
          <div className={styles.textContent}>
            {heading && <h2 className={styles.sectionHeading}>{heading}</h2>}
            {subheading && <h3 className={styles.subheading}>{subheading}</h3>}
            {description && <p className={styles.sectionDescription}>{description}</p>}
            
            {features && (
              <div className={styles.featuresList}>
                {features.map((feature, index) => (
                  <h3 key={index} className={styles.featureTitle}>{feature}</h3>
                ))}
              </div>
            )}
            
            {buttons && (
              <div className={styles.buttonGroup}>
                {buttons.map((button, index) => (
                  <button 
                    key={index} 
                    className={`${styles.button} ${button.primary ? styles.primaryButton : styles.secondaryButton}`}
                    onClick={button.onClick}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {hasImage && (
            <div className={styles.imageContent}>
              {imageContent || <div className={styles.imagePlaceholder}>Image</div>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;

