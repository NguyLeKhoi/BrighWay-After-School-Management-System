import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '@components/Common/AuthCard';
import Form from '../../../components/Common/Form';
import Loading from '../../../components/Common/Loading';
import { loginSchema } from '../../../utils/validationSchemas';
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification, showGlobalError } = useApp();
  const { isLoading, showLoading, hideLoading } = useLoading(1500);

  const handleSubmit = async (data) => {
    showLoading();

    try {
      const result = await login({
        email: data.email,
        password: data.password
      });

      // Get user info to check role
      const user = result.user;
      
      // Log user info for debugging
      console.log('🚀 Login successful! User:', user);
      console.log('🎯 User role:', user.role);
      
      // Show success notification
      addNotification({
        message: 'Đăng nhập thành công!',
        severity: 'success'
      });
      
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
      const errorMessage = err.message || 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };


  return (
    <>
      {isLoading && <Loading />}
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <AuthCard
            title="Login"
          >
            <Form
              schema={loginSchema}
              onSubmit={handleSubmit}
              submitText="Login"
              fields={[
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'password', label: 'Mật khẩu', type: 'password', required: true }
              ]}
            />
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot Password
            </Link>
          </AuthCard>
        </div>
      </div>
    </>
  );
};

export default Login;