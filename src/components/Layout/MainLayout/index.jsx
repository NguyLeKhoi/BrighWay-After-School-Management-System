import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from '../../Headers/MainHeader';
import Footer from '../../Common/Footer';
import ScrollToTop from '../../Common/ScrollToTop';
import styles from './MainLayout.module.css';

const MainLayout = ({ showHeader = true, showFooter = true }) => {
  return (
    <div className={styles.mainLayout}>
      <ScrollToTop />
      {showHeader && <MainHeader />}
      
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
