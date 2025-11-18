import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>BRIGHWAY</h3>
            <p className={styles.footerDescription}>
              Dịch vụ giữ trẻ sau giờ học với các hoạt động ngoài giờ đa dạng, phong phú. 
              Chúng tôi cam kết mang đến môi trường an toàn, vui vẻ và bổ ích cho trẻ em.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>Facebook</a>
              <a href="#" className={styles.socialLink}>Zalo</a>
              <a href="#" className={styles.socialLink}>Instagram</a>
            </div>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Liên Kết Nhanh</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/" className={styles.footerLink}>Trang Chủ</Link></li>
              <li><Link to="/packages" className={styles.footerLink}>Gói Dịch Vụ</Link></li>
              <li><Link to="/facilities" className={styles.footerLink}>Cơ Sở Vật Chất</Link></li>
              <li><Link to="/contact" className={styles.footerLink}>Liên Hệ</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Dịch Vụ</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/packages" className={styles.footerLink}>Gói Dịch Vụ Giữ Trẻ</Link></li>
              <li><Link to="/facilities" className={styles.footerLink}>Cơ Sở Vật Chất</Link></li>
              <li><Link to="/contact" className={styles.footerLink}>Đăng Ký Dịch Vụ</Link></li>
              <li><Link to="/login" className={styles.footerLink}>Đăng Nhập</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Thông Tin Liên Hệ</h4>
            <div className={styles.contactInfo}>
              <p>Email: info@brighway.com</p>
              <p>Điện thoại: 1900 1234</p>
              <p>Địa chỉ: Thành phố Hồ Chí Minh, Việt Nam</p>
              <p>Giờ làm việc: Thứ 2 - Thứ 6: 7:00 - 18:00</p>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.footerCopyright}>
            <p>&copy; 2024 BRIGHWAY. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
