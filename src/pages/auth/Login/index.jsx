import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Box, IconButton } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
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
      console.log('🔑 Access Token:', result.accessToken ? 'Received' : 'Missing');
      console.log('🔄 Refresh Token:', result.refreshToken ? 'Received' : 'Missing');
      
      // Show success notification
      addNotification({
        message: 'Đăng nhập thành công!',
        severity: 'success'
      });
      
      // Redirect based on role (handle both string and number roles)
      const role = user.role;
      console.log('🔍 Role type:', typeof role, 'Value:', role);
      
      if (role === 'Admin' || role === 0) {
        console.log('➡️ Redirecting to Admin dashboard...');
        navigate('/admin/dashboard');
      } else if (role === 'Manager' || role === 3) {
        console.log('➡️ Redirecting to Manager dashboard...');
        navigate('/manager/dashboard');
      } else if (role === 'Teacher' || role === 1) {
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
            headerAction={
              <IconButton
                onClick={() => navigate('/')}
                sx={{
                  color: '#1976d2',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}
                title="Về trang chủ"
              >
                <HomeIcon />
              </IconButton>
            }
          >
            {/* Portal Title inside AuthCard */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 'bold', 
                color: '#1976d2',
                mb: 1
              }}>
                BRIGHWAY
              </Typography>
              <Typography variant="h6" component="h2" sx={{ 
                color: '#666',
                fontWeight: 'normal'
              }}>
                After School Management Portal
              </Typography>
            </Box>
            <Form
              schema={loginSchema}
              onSubmit={handleSubmit}
              submitText="Đăng nhập"
              fields={[
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'password', label: 'Mật khẩu', type: 'password', required: true }
              ]}
            />
            <Link to="/forgot-password" className={styles.forgotLink}>
              Quên mật khẩu?
            </Link>
          </AuthCard>
        </div>
      </div>
    </>
  );
};

export default Login;