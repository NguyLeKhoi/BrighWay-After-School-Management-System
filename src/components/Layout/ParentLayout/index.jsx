import React from 'react';
import { Outlet } from 'react-router-dom';
import ParentSidebar from '../../Common/Sidebar/ParentSidebar';
import styles from './ParentLayout.module.css';

const ParentLayout = () => {
  return (
    <div className={styles.parentLayout}>
      <div className={styles.layoutContent}>
        <ParentSidebar />
        
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
