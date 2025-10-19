import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>MyApp</h3>
            <p className={styles.footerDescription}>
              Your trusted platform for modern solutions and innovative services.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>Facebook</a>
              <a href="#" className={styles.socialLink}>Twitter</a>
              <a href="#" className={styles.socialLink}>LinkedIn</a>
              <a href="#" className={styles.socialLink}>Instagram</a>
            </div>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/" className={styles.footerLink}>Home</Link></li>
              <li><Link to="/about" className={styles.footerLink}>About Us</Link></li>
              <li><Link to="/services" className={styles.footerLink}>Services</Link></li>
              <li><Link to="/contact" className={styles.footerLink}>Contact</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Support</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/help" className={styles.footerLink}>Help Center</Link></li>
              <li><Link to="/faq" className={styles.footerLink}>FAQ</Link></li>
              <li><Link to="/privacy" className={styles.footerLink}>Privacy Policy</Link></li>
              <li><Link to="/terms" className={styles.footerLink}>Terms of Service</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Contact Info</h4>
            <div className={styles.contactInfo}>
              <p>Email: info@myapp.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Main St, City, State 12345</p>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.footerCopyright}>
            <p>&copy; 2024 MyApp. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
