import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from '../../Headers/MainHeader';
import Footer from '../../Common/Footer';
import ScrollToTop from '../../Common/ScrollToTop';
import PageTransition from '../../Common/PageTransition';
import styles from './MainLayout.module.css';

const MainLayout = ({ showHeader = true, showFooter = true }) => {
  return (
    <div className={styles.mainLayout}>
      <ScrollToTop />
      {showHeader && <MainHeader />}
      
      <main className={styles.mainContent}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
