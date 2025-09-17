import React from 'react';
import { Outlet } from 'react-router-dom';
import ParentHeader from '../../Common/Headers/ParentHeader';
import Footer from '../../Common/Footer';
import styles from './ParentLayout.module.css';

const ParentLayout = () => {
  return (
    <div className={styles.parentLayout}>
      <ParentHeader />
      
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default ParentLayout;
