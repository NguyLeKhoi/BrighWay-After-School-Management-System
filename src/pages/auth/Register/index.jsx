import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mock registration logic
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userName', formData.fullName);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.location.href = '/';
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
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        
        <div className={styles.card}>
          <Link to="/" className={styles.homeIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </Link>
          <h3 className={styles.cardTitle}>Create an account</h3>
          
          <div className={styles.googleSignup}>
            <button onClick={handleGoogleAuth} className={styles.googleButton}>
              <span className={styles.googleIcon}>G</span>
              Continue With Google
            </button>
          </div>
          
          <div className={styles.separator}>
            <span className={styles.separatorText}>Or</span>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email or Phone</label>
              <input
                type="text"
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
            
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.formLabel}>Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
            
            <button type="submit" className={styles.continueButton}>
              Continue
            </button>
          </form>
          
          <div className={styles.loginLink}>
            Already have an account? <Link to="/login" className={styles.link}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;