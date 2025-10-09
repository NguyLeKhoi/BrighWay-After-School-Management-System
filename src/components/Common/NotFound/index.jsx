import React from 'react';
import { Link } from 'react-router-dom';
import Threads from '../../Animation/Background/Threads';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.notfoundPage}>
      <div className={styles.threadsBackground}>
        <Threads
          amplitude={2.5}
          distance={0}
          enableMouseInteraction={true}
        />
      </div>
      <div className={styles.notfoundContainer}>
        <div className={styles.notfoundContent}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.errorTitle}>Page Not Found</h1>
          <p className={styles.errorDescription}>
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>

          <div className={styles.errorActions}>
            <Link to="/" className={styles.homeButton}>
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className={styles.backButton}
            >
              Go Back
            </button>
          </div>

          <div className={styles.helpLinks}>
            <p className={styles.helpText}>Maybe you were looking for:</p>
            <ul className={styles.helpList}>
              <li><Link to="/login" className={styles.helpLink}>Login</Link></li>
              <li><Link to="/register" className={styles.helpLink}>Register</Link></li>
              <li><Link to="/" className={styles.helpLink}>Home</Link></li>
              <li><Link to="/contact" className={styles.helpLink}>Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.notfoundIllustration}>
          <div className={styles.illustrationContainer}>
            <div className={styles.illustrationIcon}>🔍</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
