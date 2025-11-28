import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Cancel as CancelIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import AuthCard from '../../../components/Auth/AuthCard';
import depositService from '../../../services/deposit.service';
import styles from './PaymentCancel.module.css';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addNotification } = useApp();
  const { isLoading, showLoading, hideLoading } = useContentLoading();
  
  const [isValid, setIsValid] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Only allow User role - redirect other roles to their appropriate pages
    if (user.role?.toLowerCase() !== 'user') {
      const userRole = user.role?.toLowerCase();
      let redirectPath = '/';
      
      // Redirect based on role
      if (userRole === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (userRole === 'manager') {
        redirectPath = '/manager/dashboard';
      } else if (userRole === 'staff') {
        redirectPath = '/staff/dashboard';
      }
      
      navigate(redirectPath, { replace: true });
      return;
    }

    // Get query parameters from PayOS redirect
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');
    const depositId = searchParams.get('depositId');
    const code = searchParams.get('code'); // PayOS return code

    // If no valid parameters from PayOS, redirect to wallet
    // This prevents users from accessing this page directly by typing URL
    if (!orderCode && !depositId && !code) {
      navigate('/user/finance/main-wallet', { replace: true });
      return;
    }

    // Set payment info and call cancel API
    const setPaymentInfoData = async () => {
      if (hasChecked) return;
      setHasChecked(true);

      showLoading();
      try {
        // Nếu có depositId, gọi API để hủy deposit
        if (depositId && depositId !== 'N/A') {
          try {
            await depositService.cancelDeposit(depositId);
            addNotification({
              message: 'Đã hủy giao dịch thành công.',
              severity: 'success'
            });
          } catch (cancelError) {
            // Vẫn hiển thị trang cancel dù API có lỗi
            addNotification({
              message: 'Thanh toán đã bị hủy. Bạn có thể thử lại bất cứ lúc nào.',
              severity: 'info'
            });
          }
        } else {
          addNotification({
            message: 'Thanh toán đã bị hủy. Bạn có thể thử lại bất cứ lúc nào.',
            severity: 'info'
          });
        }

        setIsValid(true);
        setPaymentInfo({
          orderCode: orderCode || 'N/A',
          depositId: depositId || 'N/A',
          status: status || code || 'cancelled'
        });
      } catch (error) {
        setIsValid(true);
        setPaymentInfo({
          orderCode: orderCode || 'N/A',
          depositId: depositId || 'N/A',
          status: status || code || 'cancelled'
        });
        addNotification({
          message: 'Thanh toán đã bị hủy. Bạn có thể thử lại bất cứ lúc nào.',
          severity: 'info'
        });
      } finally {
        hideLoading();
      }
    };

    setPaymentInfoData();
  }, [user, navigate, searchParams, hasChecked, showLoading, hideLoading, addNotification]);

  const handleBackToWallet = () => {
    navigate('/user/finance/main-wallet', { replace: true });
  };

  // Show loading while checking
  if (!hasChecked || isLoading) {
    return <ContentLoading isLoading={true} text="Đang xử lý..." />;
  }

  // If invalid, redirect (handled in useEffect)
  if (!isValid) {
    return null;
  }

  return (
    <div className={styles.paymentCancelPage}> 
      <div className={styles.container}>
        <AuthCard title="Thanh toán đã hủy">
          <Fade in={true} timeout={500}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Zoom in={true} timeout={600}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                      color: 'white',
                      boxShadow: '0 8px 24px rgba(255, 152, 0, 0.3)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 64 }} />
                  </Box>
                </Box>
              </Zoom>

              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  mb: 2
                }}
              >
                Giao dịch đã bị hủy
              </Typography>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.8
                }}
              >
                Thanh toán của bạn đã bị hủy hoặc không hoàn tất. 
                Số dư ví của bạn không thay đổi. Bạn có thể thử lại bất cứ lúc nào.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<WalletIcon />}
                onClick={handleBackToWallet}
                sx={{
                  minWidth: 200,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)'
                  }
                }}
              >
                Về trang ví
              </Button>
            </Box>
          </Fade>
        </AuthCard>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentCancel;

