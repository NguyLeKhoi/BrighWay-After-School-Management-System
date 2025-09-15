import React from 'react';
import { Outlet } from 'react-router-dom';
import Threads from '../../Animation/Background/Threads';
import styles from './AuthLayout.module.css';

const AuthLayout = ({ children }) => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.threadsBackground}>
        <Threads
          amplitude={2.5}
          distance={0}
          enableMouseInteraction={true}
        />
      </div>
      <div className={styles.authContainer}>
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AuthLayout;
