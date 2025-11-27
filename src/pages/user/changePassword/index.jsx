import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  Alert, 
  Paper,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import Form from '../../../components/Common/Form';
import AuthCard from '../../../components/Auth/AuthCard';
import authService from '../../../services/auth.service';
import { resetPasswordSchema } from '../../../utils/validationSchemas/authSchemas';
import styles from './ChangePassword.module.css';

// Helper function to mask email for privacy
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  
  // Show first 2 characters, mask the rest
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  const visiblePart = localPart.substring(0, 2);
  return `${visiblePart}***@${domain}`;
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification, showGlobalError } = useApp();
  const { isLoading, loadingText, showLoading, hideLoading } = useContentLoading();
  
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else {
      // If no user, redirect to login
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSendCode = async () => {
    if (!email) {
      showGlobalError('Email không hợp lệ');
      return;
    }

    showLoading();
    try {
      await authService.sendResetCode({ email });
      setCodeSent(true);
      setActiveStep(1);
      addNotification({
        message: 'Mã xác nhận đã được gửi đến email của bạn!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Send reset code error:', err);
      const errorMessage = err?.message || err?.error || 'Không thể gửi mã xác nhận. Vui lòng thử lại.';
      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      hideLoading();
    }
  };

  const handleResetPassword = async (data) => {
    showLoading();
    try {
      // First validate the code (optional step)
      try {
        await authService.validateResetCode({
          email: data.email,
          code: data.code
        });
      } catch (validateError) {
        // If validation fails, still try to reset password (as validation is optional)
      }

      // Reset password with code
      await authService.resetPasswordWithCode({
        email: data.email,
        code: data.code,
        newPassword: data.newPassword
      });

      setPasswordChanged(true);
      addNotification({
        message: 'Đổi mật khẩu thành công!',
        severity: 'success'
      });

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate('/family/profile');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err?.message || err?.error || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mã xác nhận.';
      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      hideLoading();
    }
  };

  if (passwordChanged) {
    return (
      <div className={styles.changePasswordPage}>
        <div className={styles.container}>
        <AuthCard>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/family/profile')}
              sx={{
                color: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-50)'
                }
              }}
              title="Về trang hồ sơ"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
              Đổi mật khẩu
            </Typography>
          </Box>
            <Zoom in={true} timeout={500}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'success.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    color: 'success.main'
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
                  Đổi mật khẩu thành công!
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Mật khẩu của bạn đã được đổi thành công. Bạn sẽ được chuyển về trang hồ sơ trong giây lát...
                </Typography>
              </Box>
            </Zoom>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/family/profile')}
              sx={{
                py: 1.5,
                background: 'var(--color-primary)',
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  background: 'var(--color-primary-dark)'
                }
              }}
            >
              Về trang hồ sơ
            </Button>
          </AuthCard>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.changePasswordPage}>
      {isLoading && <ContentLoading isLoading={isLoading} text={loadingText} />}
      <div className={styles.container}>
        <AuthCard>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/family/profile')}
              sx={{
                color: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-50)'
                }
              }}
              title="Quay lại"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
              Đổi mật khẩu
            </Typography>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
              {/* Step 1 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeStep >= 0 ? 'var(--color-primary)' : 'grey.300',
                    color: activeStep >= 0 ? 'white' : 'grey.600',
                    transition: 'all 0.3s ease',
                    boxShadow: activeStep === 0 ? '0 4px 12px rgba(0, 123, 255, 0.3)' : 'none'
                  }}
                >
                  {activeStep > 0 ? (
                    <CheckCircleIcon sx={{ fontSize: 24 }} />
                  ) : (
                    <EmailIcon sx={{ fontSize: 24 }} />
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: activeStep === 0 ? 600 : 400,
                    color: activeStep >= 0 ? 'var(--color-primary)' : 'text.secondary',
                    minWidth: 120
                  }}
                >
                  Gửi mã xác nhận
                </Typography>
              </Box>
              
              {/* Connector */}
              <Box
                sx={{
                  width: 60,
                  height: 2,
                  backgroundColor: activeStep >= 1 ? 'var(--color-primary)' : 'grey.300',
                  transition: 'all 0.3s ease',
                  mx: 1
                }}
              />
              
              {/* Step 2 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeStep >= 1 ? 'var(--color-primary)' : 'grey.300',
                    color: activeStep >= 1 ? 'white' : 'grey.600',
                    transition: 'all 0.3s ease',
                    boxShadow: activeStep === 1 ? '0 4px 12px rgba(0, 123, 255, 0.3)' : 'none'
                  }}
                >
                  <LockIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: activeStep === 1 ? 600 : 400,
                    color: activeStep >= 1 ? 'var(--color-primary)' : 'text.secondary',
                    minWidth: 140
                  }}
                >
                  Nhập mã và mật khẩu mới
                </Typography>
              </Box>
            </Box>
          </Box>

          {activeStep === 0 && (
            <Fade in={true} timeout={500}>
              <Box>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: 'primary.50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'primary.main'
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Gửi mã xác nhận
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Chúng tôi sẽ gửi mã xác nhận 5 ký tự đến email của bạn để xác thực việc đổi mật khẩu.
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    mb: 3,
                    p: 2.5,
                    bgcolor: 'primary.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.200'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Email của bạn:
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 600, pl: 4 }}>
                    {maskEmail(email)}
                  </Typography>
                </Paper>
                <Button
                  variant="contained"
                  onClick={handleSendCode}
                  disabled={isLoading || !email}
                  fullWidth
                  startIcon={<SecurityIcon />}
                  sx={{
                    py: 1.5,
                    background: 'var(--color-primary)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'var(--color-primary-dark)'
                    },
                    '&:disabled': {
                      background: 'grey.300'
                    }
                  }}
                >
                  Gửi mã xác nhận
                </Button>
              </Box>
            </Fade>
          )}

          {activeStep === 1 && (
            <Fade in={true} timeout={500}>
              <Box>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: 'primary.50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'primary.main'
                    }}
                  >
                    <LockIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Nhập mã và mật khẩu mới
                  </Typography>
                </Box>
                <Alert 
                  severity="info" 
                  icon={<EmailIcon />}
                  sx={{ 
                    mb: 3,
                    '& .MuiAlert-message': {
                      width: '100%'
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    Mã xác nhận đã được gửi đến email <strong>{maskEmail(email)}</strong>. 
                    Vui lòng kiểm tra hộp thư và nhập mã cùng mật khẩu mới bên dưới.
                  </Typography>
                </Alert>
                <Form
                  schema={resetPasswordSchema}
                  onSubmit={handleResetPassword}
                  submitText="Đổi mật khẩu"
                  defaultValues={{ email }}
                  fields={[
                    { 
                      name: 'email', 
                      label: 'Email', 
                      type: 'email', 
                      required: true,
                      disabled: true,
                      helperText: 'Email đã được xác định'
                    },
                    { 
                      name: 'code', 
                      label: 'Mã xác nhận', 
                      type: 'text', 
                      required: true,
                      placeholder: 'Nhập mã 5 ký tự',
                      helperText: 'Nhập mã xác nhận 5 ký tự đã được gửi đến email của bạn',
                      inputProps: {
                        maxLength: 5,
                        style: { 
                          textTransform: 'uppercase',
                          letterSpacing: '0.2em',
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }
                      }
                    },
                    { 
                      name: 'newPassword', 
                      label: 'Mật khẩu mới', 
                      type: 'password', 
                      required: true,
                      placeholder: 'Nhập mật khẩu mới',
                      helperText: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số'
                    },
                    { 
                      name: 'confirmPassword', 
                      label: 'Xác nhận mật khẩu', 
                      type: 'password', 
                      required: true,
                      placeholder: 'Nhập lại mật khẩu mới'
                    }
                  ]}
                />
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="text"
                    onClick={() => {
                      setActiveStep(0);
                      setCodeSent(false);
                      handleSendCode();
                    }}
                    startIcon={<EmailIcon />}
                    sx={{ 
                      color: 'var(--color-primary)',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'primary.50'
                      }
                    }}
                  >
                    Gửi lại mã xác nhận
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
        </AuthCard>
      </div>
    </div>
  );
};

export default ChangePassword;

