import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import styles from './AuthCard.module.css';

const AuthCard = ({ 
  title, 
  children,
  bottomLink,
  headerAction
}) => {
  return (
    <div className={styles.card}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <h2 className={styles.cardTitle} style={{ margin: 0, flex: 1 }}>
          {title}
        </h2>
        {headerAction && (
          <Box sx={{ ml: 2 }}>
            {headerAction}
          </Box>
        )}
      </Box>
      
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

