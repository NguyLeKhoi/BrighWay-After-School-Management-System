import React from 'react';
import { Outlet } from 'react-router-dom';
import Threads from '../../Animation/Background/Threads';
import PageTransition from '../../Common/PageTransition';
import ScrollToTop from '../../Common/ScrollToTop';
import styles from './AuthLayout.module.css';

const AuthLayout = () => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.threadsBackground}>
        <Threads
          color={[0.1, 0.1, 0.1]}
          amplitude={3}
          distance={0.1}
          enableMouseInteraction={false}
        />
      </div>
      <div className={styles.authContainer}>
        <ScrollToTop />
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
    </div>
  );
};

export default AuthLayout;
