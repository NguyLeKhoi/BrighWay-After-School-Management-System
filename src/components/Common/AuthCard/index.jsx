import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthCard.module.css';

const AuthCard = ({ 
  title, 
  children,
  bottomLink
}) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      
      {children}
      
      {bottomLink && (
        <div className={styles.bottomLink}>
          {bottomLink.text} <Link to={bottomLink.to} className={styles.link}>{bottomLink.linkText}</Link>
        </div>
      )}
    </div>
  );
};

export default AuthCard;

