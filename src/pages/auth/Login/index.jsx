import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mock login logic
      if (formData.email === 'admin@example.com' && formData.password === 'admin123') {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('userRole', 'admin');
        window.location.href = '/';
      } else if (formData.email === 'user@example.com' && formData.password === 'user123') {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('userRole', 'user');
        window.location.href = '/';
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    console.log('Google authentication clicked');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        
        <div className={styles.card}>
          <Link to="/" className={styles.homeIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </Link>
          <h3 className={styles.cardTitle}>Login</h3>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <label htmlFor="rememberMe" className={styles.checkboxLabel}>Remember Me?</label>
            </div>
            
            <button type="submit" className={styles.continueButton}>
              Continue
            </button>
            
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot Password
            </Link>
          </form>
          
          <div className={styles.separator}>
            <span className={styles.separatorText}>Or</span>
          </div>
          
          <div className={styles.socialLogin}>
            <button onClick={handleGoogleAuth} className={styles.socialButton}>
              <span className={styles.socialIcon}>G</span>
            </button>
            <button className={styles.socialButton}>
              <span className={styles.socialIcon}>in</span>
            </button>
            <button className={styles.socialButton}>
              <span className={styles.socialIcon}>f</span>
            </button>
          </div>
          
          <div className={styles.signupLink}>
            Don't have an account? <Link to="/register" className={styles.link}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;