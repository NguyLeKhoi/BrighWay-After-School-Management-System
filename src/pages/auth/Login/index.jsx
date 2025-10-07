import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '@components/Common/AuthCard';
import Form from '@components/Common/Form';
import authService from '../../../services/auth.service';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
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
      // Call real authentication API
      const result = await authService.login({
        email: formData.email,
        password: formData.password
      });

      // Get user info to check role
      const user = result.user;
      
      // Log user info for debugging
      console.log('🚀 Login successful! User:', user);
      console.log('🎯 User role:', user.role);
      
      // Redirect based on role
      if (user.role === 'Admin') {
        console.log('➡️ Redirecting to Admin dashboard...');
        navigate('/admin/dashboard');
      } else if (user.role === 'Teacher') {
        console.log('➡️ Redirecting to Teacher dashboard...');
        navigate('/teacher/dashboard');
      } else {
        console.log('➡️ Redirecting to Parent profile...');
        navigate('/parent/profile');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const formFields = [
    { name: 'email', label: 'Email', type: 'email', value: formData.email, onChange: handleChange, required: true },
    { name: 'password', label: 'Password', type: 'password', value: formData.password, onChange: handleChange, required: true },
    { name: 'rememberMe', label: 'Remember Me?', type: 'checkbox', value: formData.rememberMe, onChange: handleChange }
  ];

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <AuthCard
          title="Login"
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