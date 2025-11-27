import React from 'react';
import { Outlet } from 'react-router-dom';
import Threads from '../../Animation/Background/Threads';
import PageTransition from '../../Common/PageTransition';
import styles from './AuthLayout.module.css';

const AuthLayout = () => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.threadsBackground}>
        <Threads
          amplitude={2.5}
          distance={0}
          enableMouseInteraction={false}
        />
      </div>
      <div className={styles.authContainer}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
    </div>
  );
};

export default AuthLayout;
