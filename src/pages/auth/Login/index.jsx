import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '@components/Common/AuthCard';
import Form from '@components/Common/Form';
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


  const formFields = [
    { name: 'email', label: 'Email', type: 'email', value: formData.email, onChange: handleChange, required: true },
    { name: 'password', label: 'Password', type: 'password', value: formData.password, onChange: handleChange, required: true },
    { name: 'rememberMe', label: 'Remember Me?', type: 'checkbox', value: formData.rememberMe, onChange: handleChange }
  ];

  const bottomLink = {
    text: "Don't have an account?",
    to: "/register",
    linkText: "Sign Up"
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <AuthCard
          title="Login"
          bottomLink={bottomLink}
        >
          <Form
            fields={formFields}
            onSubmit={handleSubmit}
            submitText="Login"
            isLoading={isLoading}
            error={error}
          />
          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot Password
          </Link>
        </AuthCard>
      </div>
    </div>
  );
};

export default Login;