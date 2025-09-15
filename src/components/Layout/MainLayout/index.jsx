import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../Common/Header';
import Footer from '../../Common/Footer';
import styles from './MainLayout.module.css';

const MainLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className={styles.mainLayout}>
      {showHeader && <Header />}
      
      <main className={styles.mainContent}>
        {children || <Outlet />}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
