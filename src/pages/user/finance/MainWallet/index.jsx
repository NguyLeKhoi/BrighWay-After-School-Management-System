import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Paper,
  CircularProgress,
  Pagination
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Refresh,
  AttachMoney as MoneyIcon,
  History,
  TrendingUp,
  CheckCircle,
  Pending,
  Cancel
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import { useApp } from '../../../../contexts/AppContext';
import useContentLoading from '../../../../hooks/useContentLoading';
import depositService from '../../../../services/deposit.service';
import walletService from '../../../../services/wallet.service';
import styles from '../Finance.module.css';

const DEFAULT_WALLET_DATA = {
  mainWallet: {
    balance: 0,
    currency: 'VND',
    type: 'Parent',
    walletId: '',
    createdTime: '',
    userEmail: ''
  }
};

const MainWallet = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  const [walletError, setWalletError] = useState(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const checkoutMonitorRef = useRef(null);
  const shouldAutoSyncRef = useRef(false);
  const [walletData, setWalletData] = useState(DEFAULT_WALLET_DATA);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpError, setTopUpError] = useState('');
  const [showTopUpForm, setShowTopUpForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalPages: 1,
    totalCount: 0
  });

  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading();

  const loadWalletData = async ({ showSpinner = false } = {}) => {
    setWalletError(null);
    if (showSpinner) {
      setIsWalletLoading(true);
    }

    try {
      const walletResponse = await walletService.getCurrentWallet();

      setWalletData((prev) => ({
        ...prev,
        mainWallet: {
          ...prev.mainWallet,
          balance: walletResponse.balance ?? 0,
          currency: 'VND',
          type: walletResponse.type || prev.mainWallet.type,
          walletId: walletResponse.id || prev.mainWallet.walletId,
          createdTime: walletResponse.createdTime || prev.mainWallet.createdTime,
          userEmail: walletResponse.userEmail || prev.mainWallet.userEmail
        }
      }));

      return walletResponse;
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể tải thông tin ví';

      setWalletError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showSpinner) {
        setIsWalletLoading(false);
      }
    }
  };

  useEffect(() => {
    loadWalletData({ showSpinner: true });
    loadTransactions(1);
  }, []);

  useEffect(() => {
    if (location.pathname === '/family/finance/main-wallet') {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadWalletData({ showSpinner: false });
    }
  }, [location.pathname]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Load transaction history (deposits)
  const loadTransactions = async (pageIndex = 1, pageSize = 20) => {
    setIsLoadingTransactions(true);
    setTransactionError(null);

    try {
      const response = await depositService.getMyDeposits({
        pageIndex,
        pageSize
      });

      // API response có structure: { items: [...], totalPages, totalCount, ... }
      const deposits = response.items || [];
      
      // Map deposits từ API sang format của component
      const mappedTransactions = deposits.map((deposit) => {
        // Ensure timestamp is treated as UTC
        let timestamp = deposit.timestamp || new Date().toISOString();
        // If timestamp doesn't have timezone indicator (Z or +HH:MM), add Z to indicate UTC
        if (timestamp && typeof timestamp === 'string') {
          // Check if it's ISO format without timezone
          if (timestamp.includes('T') && !timestamp.endsWith('Z') && !timestamp.match(/[+-]\d{2}:\d{2}$/)) {
            // Remove fractional seconds if present and add Z
            timestamp = timestamp.replace(/\.\d+$/, '') + 'Z';
          }
        }
        
        // Lấy checkoutUrl từ localStorage nếu có
        let checkoutUrl = deposit.checkoutUrl || null;
        if (!checkoutUrl && deposit.id) {
          try {
            checkoutUrl = localStorage.getItem(`deposit_checkout_${deposit.id}`) || null;
          } catch (e) {
            // Silent fail - localStorage access denied
          }
        }

        return {
          id: deposit.id,
          type: 'topup', // Tất cả deposits đều là topup
          amount: deposit.amount || 0,
          description: `Nạp tiền - Order #${deposit.payOSOrderCode || 'N/A'}`,
          date: timestamp,
          status: deposit.status?.toLowerCase() || 'pending',
          wallet: 'main',
          payOSOrderCode: deposit.payOSOrderCode,
          payOSTransactionId: deposit.payOSTransactionId,
          checkoutUrl: checkoutUrl // Lưu checkoutUrl vào transaction
        };
      });

      setTransactions(mappedTransactions);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        pageIndex,
        pageSize,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0
      }));
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể tải lịch sử giao dịch';
      
      setTransactionError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const getTransactionIcon = (type) => {
    const iconStyle = { fontSize: 24 };
    switch (type) {
      case 'topup':
      case 'refill':
        return <TrendingUp sx={iconStyle} />;
      default:
        return <AccountBalanceWallet sx={iconStyle} />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup':
      case 'refill':
        return 'var(--color-success)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    const iconStyle = { fontSize: 16, marginRight: 4 };
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle sx={{ ...iconStyle, color: 'var(--color-success)' }} />;
      case 'pending':
        return <Pending sx={{ ...iconStyle, color: 'var(--color-warning)' }} />;
      case 'failed':
      case 'cancelled':
        return <Cancel sx={{ ...iconStyle, color: 'var(--color-error)' }} />;
      default:
        return null;
    }
  };

  const handlePageChange = (newPage) => {
    loadTransactions(newPage, pagination.pageSize);
  };

  const handleTopUpClick = () => {
    setShowTopUpForm(!showTopUpForm);
    if (showTopUpForm) {
      setTopUpAmount('');
      setTopUpError('');
    }
  };

  const handleTopUpCancel = () => {
    setShowTopUpForm(false);
    setTopUpAmount('');
    setTopUpError('');
  };

  const handleTopUpAmountChange = (e) => {
    const value = e.target.value;
    setTopUpAmount(value);
    setTopUpError('');

    if (value && (isNaN(value) || Number(value) <= 0)) {
      setTopUpError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
    } else if (value && Number(value) < 1000) {
      setTopUpError('Số tiền tối thiểu là 1.000 VND');
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || topUpAmount.trim() === '') {
      setTopUpError('Vui lòng nhập số tiền');
      return;
    }

    const amount = Number(topUpAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      setTopUpError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    if (amount < 1000) {
      setTopUpError('Số tiền tối thiểu là 1.000 VND');
      return;
    }

    let checkoutWindow = null;

    try {
      checkoutWindow = window.open('about:blank', '_blank');
      showLoading();
      setShowTopUpForm(false);
      setTopUpAmount('');
      setTopUpError('');

      const depositResponse = await depositService.createDeposit(amount);
      const checkoutUrl = depositResponse?.checkoutUrl;
      const depositId = depositResponse?.depositId;

      if (depositId && checkoutUrl) {
        try {
          localStorage.setItem(`deposit_checkout_${depositId}`, checkoutUrl);
        } catch (e) {
          // Silent fail - localStorage access denied
        }
      }

      if (checkoutUrl) {
        if (checkoutWindow) {
          checkoutWindow.location.href = checkoutUrl;
          checkoutWindow.focus();
        } else {
          window.location.href = checkoutUrl;
        }

        shouldAutoSyncRef.current = true;

        if (checkoutMonitorRef.current) {
          clearInterval(checkoutMonitorRef.current);
        }
        checkoutMonitorRef.current = setInterval(() => {
          if (!checkoutWindow || checkoutWindow.closed) {
            clearInterval(checkoutMonitorRef.current);
            checkoutMonitorRef.current = null;
            handleSyncWallet({ silent: true });
          }
        }, 2000);
      } else if (checkoutWindow) {
        checkoutWindow.close();
      }

      addNotification({
        message: 'Đang chuyển tới PayOS để hoàn tất nạp tiền.',
        severity: 'success'
      });
    } catch (error) {
      if (checkoutWindow) {
        checkoutWindow.close();
      }
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Có lỗi xảy ra khi nạp tiền';

      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      hideLoading();
    }
  };

  const handleSyncWallet = async ({ silent = false } = {}) => {
    if (isSyncing || !shouldAutoSyncRef.current) return;

    try {
      setIsSyncing(true);
      if (!silent) {
        showLoading();
      }

      const previousBalance = walletData.mainWallet.balance;

      await depositService.triggerPayosWebhook();
      const latestWallet = await loadWalletData();

      const newBalance = latestWallet?.balance ?? previousBalance;
      const hasBalanceChanged = newBalance !== previousBalance;

      if (hasBalanceChanged) {
        shouldAutoSyncRef.current = false;
        addNotification({
          message: 'Số dư ví đã được cập nhật từ PayOS',
          severity: 'success'
        });
      } else {
        shouldAutoSyncRef.current = silent;
        if (!silent) {
          addNotification({
            message: 'Chưa nhận được giao dịch mới từ PayOS. Vui lòng kiểm tra lại sau.',
            severity: 'info'
          });
        }
      }
    } catch (error) {
      shouldAutoSyncRef.current = true;

      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể đồng bộ ví từ PayOS';

      if (!silent) {
        showGlobalError(errorMessage);
        addNotification({
          message: errorMessage,
          severity: 'error'
        });
      }
    } finally {
      setIsSyncing(false);
      if (!silent) {
        hideLoading();
      }
    }
  };

  useEffect(() => {
    const handleWindowFocus = () => {
      if (shouldAutoSyncRef.current) {
        handleSyncWallet({ silent: true });
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      if (checkoutMonitorRef.current) {
        clearInterval(checkoutMonitorRef.current);
      }
    };
  }, []);

  const mainWalletInfo = [
    { label: 'Loại ví', value: walletData.mainWallet.type === 'Parent' ? 'Ví phụ huynh' : walletData.mainWallet.type || '—' },
    { label: 'Email liên kết', value: walletData.mainWallet.userEmail || '—' },
    walletData.mainWallet.createdTime && {
      label: 'Ngày tạo',
      value: new Date(walletData.mainWallet.createdTime).toLocaleString('vi-VN')
    },
    { label: 'Mục đích', value: 'Thanh toán học phí, phí thành viên và các khoản phí chính' }
  ].filter(Boolean);

  if (isWalletLoading) {
    return <ContentLoading isLoading={isWalletLoading} text={loadingText || 'Đang tải thông tin ví...'} />;
  }

  return (
    <motion.div 
      className={styles.financePage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.container}>
        <h1 className={styles.title}>Ví chính</h1>

        {walletError && (
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{walletError}</p>
            <button className={styles.retryButton} onClick={() => loadWalletData({ showSpinner: true })}>
              <Refresh sx={{ fontSize: 16, mr: 0.5 }} />
              Thử lại
            </button>
          </div>
        )}
        
        {/* Main Wallet Overview - 2 Column Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
            gap: 3,
            marginBottom: 3
          }}
        >
          {/* Left: Balance & Info */}
          <Paper
            elevation={0}
            sx={{
              padding: 4,
              backgroundColor: 'var(--bg-primary)',
              border: '2px solid var(--color-primary-50)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-xl)',
                  background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <AccountBalanceWallet sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'var(--font-family-heading)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)',
                    marginBottom: 0.5
                  }}
                >
                  Ví chính
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {walletData.mainWallet.type === 'Parent' ? 'Ví phụ huynh' : walletData.mainWallet.type || '—'}
                </Typography>
              </Box>
            </Box>

            {/* Balance Display */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: 3,
                marginBottom: 3,
                textAlign: 'center',
                border: '1px solid var(--color-primary-100)'
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  display: 'block',
                  marginBottom: 1
                }}
              >
                Số dư
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 'var(--font-weight-extrabold)',
                  color: 'var(--color-primary-dark)',
                  lineHeight: 1.2,
                  marginBottom: 0.5,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                {formatCurrency(walletData.mainWallet.balance)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-secondary)'
                }}
              >
                VND
              </Typography>
            </Box>

            {/* Wallet Info Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2
              }}
            >
              {mainWalletInfo.map((info, index) => (
                <Box
                  key={index}
                  sx={{
                    padding: 2,
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text-secondary)',
                      display: 'block',
                      marginBottom: 0.5
                    }}
                  >
                    {info.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text-primary)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {info.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Right: Quick Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper
              elevation={0}
              sx={{
                padding: 3,
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  marginBottom: 2
                }}
              >
                Thao tác nhanh
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={handleTopUpClick}
                sx={{
                  background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-semibold)',
                  textTransform: 'none',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 24px',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 100%)',
                    boxShadow: 'var(--shadow-lg)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {showTopUpForm ? 'Hủy nạp tiền' : 'Nạp tiền'}
              </Button>
            </Paper>

            {/* Top Up Form - Inline */}
            {showTopUpForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    padding: 3,
                    backgroundColor: 'var(--bg-primary)',
                    border: '2px solid var(--color-primary-50)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2 }}>
                    <MoneyIcon sx={{ color: 'var(--color-primary)', fontSize: 24 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'var(--font-family-heading)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      Nạp tiền vào ví
                    </Typography>
                  </Box>
                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleTopUp(); }}>
                    <TextField
                      fullWidth
                      autoFocus
                      type="number"
                      label="Số tiền (VND)"
                      value={topUpAmount}
                      onChange={handleTopUpAmountChange}
                      error={!!topUpError}
                      helperText={topUpError || 'Số tiền tối thiểu: 1.000 VND'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MoneyIcon sx={{ color: 'var(--text-secondary)' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                              VND
                            </Typography>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        marginBottom: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 'var(--radius-lg)',
                          fontFamily: 'var(--font-family)',
                          '&:hover fieldset': {
                            borderColor: 'var(--color-primary)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'var(--color-primary)',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'var(--color-primary)'
                        }
                      }}
                    />
                    {topUpAmount && !topUpError && (
                      <Box
                        sx={{
                          padding: 2,
                          backgroundColor: 'var(--color-primary-50)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-primary-100)',
                          marginBottom: 2
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-family)',
                            marginBottom: 0.5
                          }}
                        >
                          Số tiền sẽ nạp:
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'var(--color-primary-dark)',
                            fontFamily: 'var(--font-family)',
                            fontWeight: 'var(--font-weight-bold)'
                          }}
                        >
                          {formatCurrency(Number(topUpAmount))}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleTopUpCancel}
                        sx={{
                          borderColor: 'var(--border-light)',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 'var(--font-weight-semibold)',
                          textTransform: 'none',
                          borderRadius: 'var(--radius-lg)',
                          padding: '12px 24px',
                          '&:hover': {
                            borderColor: 'var(--color-primary)',
                            backgroundColor: 'var(--color-primary-50)'
                          }
                        }}
                      >
                        Hủy
                      </Button>
                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={!topUpAmount || !!topUpError}
                        sx={{
                          background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 'var(--font-weight-semibold)',
                          textTransform: 'none',
                          borderRadius: 'var(--radius-lg)',
                          padding: '12px 24px',
                          boxShadow: 'var(--shadow-md)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 100%)',
                            boxShadow: 'var(--shadow-lg)',
                            transform: 'translateY(-2px)'
                          },
                          '&:disabled': {
                            opacity: 0.6
                          }
                        }}
                      >
                        <Add sx={{ fontSize: 18, mr: 0.5 }} />
                        Nạp tiền
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            )}
          </Box>
        </Box>

        {/* Transaction History (Deposits) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: 4,
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <History sx={{ color: 'var(--color-primary)', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)'
                }}
              >
                Lịch sử nạp tiền
              </Typography>
            </Box>
            {isLoadingTransactions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                <CircularProgress />
              </Box>
            ) : transactionError ? (
              <Paper
                elevation={0}
                sx={{
                  padding: 3,
                  backgroundColor: 'var(--color-error-50)',
                  border: '1px solid var(--color-error-100)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'var(--color-error-dark)',
                    marginBottom: 2,
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {transactionError}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => loadTransactions(pagination.pageIndex)}
                  startIcon={<Refresh />}
                  sx={{
                    background: 'var(--color-error)',
                    '&:hover': {
                      background: 'var(--color-error-dark)'
                    }
                  }}
                >
                  Thử lại
                </Button>
              </Paper>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <Paper
                        key={transaction.id}
                        elevation={0}
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={async () => {
                          // Nếu là giao dịch pending, mở link thanh toán
                          if (transaction.status === 'pending') {
                            let checkoutUrl = transaction.checkoutUrl;
                            
                            // Nếu chưa có checkoutUrl, thử lấy từ localStorage hoặc fetch từ API
                            if (!checkoutUrl) {
                            // Thử lấy từ localStorage
                            try {
                              checkoutUrl = localStorage.getItem(`deposit_checkout_${transaction.id}`) || null;
                            } catch (e) {
                              // Silent fail - localStorage access denied
                            }
                            
                            // Nếu vẫn chưa có, fetch từ API
                            if (!checkoutUrl && transaction.id) {
                              try {
                                const depositDetail = await depositService.getDepositById(transaction.id);
                                checkoutUrl = depositDetail?.checkoutUrl || null;
                                
                                // Lưu vào localStorage để lần sau không cần fetch
                                if (checkoutUrl) {
                                  try {
                                    localStorage.setItem(`deposit_checkout_${transaction.id}`, checkoutUrl);
                                  } catch (e) {
                                    // Silent fail - localStorage access denied
                                  }
                                }
                              } catch (error) {
                                addNotification({
                                  message: 'Không thể lấy thông tin thanh toán. Vui lòng thử lại sau.',
                                  severity: 'error'
                                });
                                return;
                              }
                            }
                            }
                            
                            if (checkoutUrl) {
                              window.open(checkoutUrl, '_blank');
                            } else {
                              addNotification({
                                message: 'Không tìm thấy link thanh toán cho giao dịch này.',
                                severity: 'warning'
                              });
                            }
                          }
                        }}
                        sx={{
                          padding: 2.5,
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2.5,
                          transition: 'all var(--transition-base)',
                          cursor: transaction.status === 'pending' ? 'pointer' : 'default',
                          '&:hover': {
                            boxShadow: 'var(--shadow-md)',
                            transform: transaction.status === 'pending' ? 'translateY(-2px)' : 'none',
                            borderColor: transaction.status === 'pending' ? 'var(--color-primary-50)' : 'var(--border-light)',
                            backgroundColor: transaction.status === 'pending' ? 'var(--color-primary-5)' : 'var(--bg-primary)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: getTransactionColor(transaction.type),
                            flexShrink: 0
                          }}
                        >
                          {getTransactionIcon(transaction.type)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontFamily: 'var(--font-family)',
                              fontWeight: 'var(--font-weight-semibold)',
                              color: 'var(--text-primary)',
                              marginBottom: 0.5
                            }}
                          >
                            {transaction.description}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'var(--font-family)',
                              color: 'var(--text-secondary)',
                              marginBottom: 0.5
                            }}
                          >
                            {(() => {
                              // Parse timestamp from API (UTC) and convert to VN time
                              const date = new Date(transaction.date);
                              // Browser will automatically convert UTC to local time (VN timezone)
                              return date.toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                            })()}
                          </Typography>
                          {transaction.status && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginTop: 0.5 }}>
                              {getStatusIcon(transaction.status)}
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: 'var(--font-family)',
                                  color: transaction.status === 'completed' 
                                    ? 'var(--color-success)' 
                                    : transaction.status === 'pending'
                                    ? 'var(--color-warning)'
                                    : 'var(--color-error)',
                                  fontWeight: 'var(--font-weight-medium)'
                                }}
                              >
                                {transaction.status === 'pending' ? 'Đang chờ' : 
                                 transaction.status === 'completed' ? 'Hoàn thành' : 
                                 transaction.status}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'var(--font-family-heading)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: getTransactionColor(transaction.type),
                            textAlign: 'right',
                            flexShrink: 0,
                            minWidth: 120
                          }}
                        >
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        padding: 4,
                        textAlign: 'center',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px dashed var(--border-light)',
                        borderRadius: 'var(--radius-lg)'
                      }}
                    >
                      <History sx={{ fontSize: 64, color: 'var(--text-tertiary)', marginBottom: 2, opacity: 0.5 }} />
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 'var(--font-weight-medium)',
                          marginBottom: 1
                        }}
                      >
                        Chưa có giao dịch nào
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-family)'
                        }}
                      >
                        Các giao dịch nạp tiền sẽ hiển thị ở đây
                      </Typography>
                    </Paper>
                  )}
                </Box>
                
                {/* Pagination Controls */}
                {pagination.totalCount > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      marginTop: 3,
                      paddingTop: 3,
                      borderTop: '1px solid var(--border-light)'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                      }}
                    >
                      <Pagination
                        count={pagination.totalPages}
                        page={pagination.pageIndex}
                        onChange={(event, value) => handlePageChange(value)}
                        disabled={isLoadingTransactions}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontFamily: 'var(--font-family)',
                            fontWeight: 'var(--font-weight-medium)',
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                              color: 'white',
                              fontWeight: 'var(--font-weight-bold)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)'
                              }
                            },
                            '&:hover': {
                              backgroundColor: 'var(--color-primary-50)'
                            }
                          }
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'var(--font-family)',
                        color: 'var(--text-secondary)',
                        textAlign: 'center'
                      }}
                    >
                      Hiển thị {((pagination.pageIndex - 1) * pagination.pageSize + 1)} - {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalCount)} trong tổng số {pagination.totalCount} giao dịch
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MainWallet;

