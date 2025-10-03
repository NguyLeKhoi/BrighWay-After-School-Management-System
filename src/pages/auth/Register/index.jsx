import React, { useState } from 'react';
import AuthCard from '@components/Common/AuthCard';
import Form from '@components/Common/Form';
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
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userName', formData.fullName);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.location.href = '/';
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', value: formData.fullName, onChange: handleChange, required: true },
    { name: 'email', label: 'Email', type: 'email', value: formData.email, onChange: handleChange, required: true },
    { name: 'password', label: 'Password', type: 'password', value: formData.password, onChange: handleChange, required: true }
  ];

  const bottomLink = {
    text: "Already have an account?",
    to: "/login",
    linkText: "Login"
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <AuthCard
          title="Register"
          bottomLink={bottomLink}
        >
          <Form
            fields={formFields}
            onSubmit={handleSubmit}
            submitText="Register"
            isLoading={isLoading}
            error={error}
          />
        </AuthCard>
      </div>
    </div>
  );
};

export default Register;