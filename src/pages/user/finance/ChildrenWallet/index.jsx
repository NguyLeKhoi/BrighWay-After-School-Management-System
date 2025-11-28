import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Wallet,
  Send,
  AttachMoney,
  School,
  Business,
  Refresh,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import { useApp } from '../../../../contexts/AppContext';
import useContentLoading from '../../../../hooks/useContentLoading';
import walletService from '../../../../services/wallet.service';
import studentService from '../../../../services/student.service';
import styles from '../Finance.module.css';

const ChildrenWallet = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  const [childWalletError, setChildWalletError] = useState(null);
  const [isChildWalletLoading, setIsChildWalletLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [childWallets, setChildWallets] = useState([]);
  const [transferForm, setTransferForm] = useState({
    toStudentId: '',
    amount: '',
    note: ''
  });

  const { showGlobalError, addNotification } = useApp();
  const { loadingText, showLoading, hideLoading } = useContentLoading();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const loadWalletData = async () => {
    try {
      await walletService.getCurrentWallet();
    } catch (error) {
      // Silent fail
    }
  };

  const loadChildWallets = async () => {
    setChildWalletError(null);
    setIsChildWalletLoading(true);

    try {
      const response = await studentService.getMyChildren();
      const students = Array.isArray(response) ? response : (Array.isArray(response?.items) ? response.items : []);

      const wallets = await Promise.all(
        students.map(async (student) => {
          try {
            const wallet = await walletService.getStudentWallet(student.id);
            return {
              studentId: student.id,
              studentName: student.name || student.userName || 'Học viên',
              balance: wallet?.balance ?? 0,
              currency: wallet?.currency || 'VND',
              walletId: wallet?.id || '',
              createdTime: wallet?.createdTime || '',
              branchName: student.branchName || student.branch?.branchName || '',
              schoolName: student.schoolName || student.school?.schoolName || '',
              levelName: student.studentLevelName || student.studentLevel?.levelName || ''
            };
          } catch (error) {
            return null;
          }
        })
      );

      setChildWallets(wallets.filter(Boolean));
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể tải ví tiêu vặt của con';
      setChildWalletError(errorMessage);
    } finally {
      setIsChildWalletLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
    loadChildWallets();
  }, []);

  useEffect(() => {
    if (location.pathname === '/family/finance/children-wallet') {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadWalletData();
      loadChildWallets();
    }
  }, [location.pathname]);

  const handleTransfer = async (event) => {
    event.preventDefault();

    if (!transferForm.toStudentId) {
      addNotification({
        message: 'Vui lòng chọn con để chuyển tiền',
        severity: 'warning'
      });
      return;
    }

    const amount = Number(transferForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      addNotification({
        message: 'Số tiền chuyển phải lớn hơn 0',
        severity: 'warning'
      });
      return;
    }

    try {
      setIsTransferring(true);
      showLoading();

      await walletService.transferToStudent({
        toStudentId: transferForm.toStudentId,
        amount,
        note: transferForm.note
      });

      addNotification({
        message: 'Chuyển tiền thành công!',
        severity: 'success'
      });

      setTransferForm({
        toStudentId: '',
        amount: '',
        note: ''
      });

      await Promise.all([
        loadWalletData(),
        loadChildWallets()
      ]);
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể chuyển tiền';

      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsTransferring(false);
      hideLoading();
    }
  };

  if (isChildWalletLoading) {
    return <ContentLoading isLoading={isChildWalletLoading} text={loadingText || 'Đang tải thông tin ví...'} />;
  }

  return (
    <motion.div 
      className={styles.financePage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.container}>
        <h1 className={styles.title}>Ví con</h1>

        {childWalletError && (
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{childWalletError}</p>
            <button className={styles.retryButton} onClick={loadChildWallets}>
              <Refresh sx={{ fontSize: 16, mr: 0.5 }} />
              Thử lại
            </button>
          </div>
        )}

        {childWallets.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' },
                gap: 3
              }}
            >
              {/* Left: Child Wallets Grid */}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'var(--font-family-heading)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)',
                    marginBottom: 2
                  }}
                >
                  Ví tiêu vặt của con
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' },
                    gap: 2.5
                  }}
                >
                  {childWallets.map((childWallet) => (
                    <Paper
                      key={childWallet.walletId || childWallet.studentId}
                      elevation={0}
                      sx={{
                        padding: 2.5,
                        backgroundColor: 'var(--bg-primary)',
                        border: '2px solid var(--color-primary-50)',
                        borderRadius: 'var(--radius-xl)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all var(--transition-base)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
                        },
                        '&:hover': {
                          boxShadow: 'var(--shadow-lg)',
                          transform: 'translateY(-4px)',
                          borderColor: 'var(--color-primary)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, marginBottom: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-sm)',
                            flexShrink: 0
                          }}
                        >
                          <Wallet sx={{ fontSize: 28, color: 'var(--color-primary)' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'var(--font-family-heading)',
                              fontWeight: 'var(--font-weight-bold)',
                              color: 'var(--text-primary)',
                              marginBottom: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {childWallet.studentName}
                          </Typography>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--color-primary-50)',
                              gap: 0.5
                            }}
                          >
                            <AttachMoney sx={{ fontSize: 14, color: 'var(--color-primary-dark)' }} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'var(--color-primary-dark)',
                                fontFamily: 'var(--font-family)',
                                fontWeight: 'var(--font-weight-bold)'
                              }}
                            >
                              {formatCurrency(childWallet.balance)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          padding: 1.5,
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        {[
                          childWallet.levelName ? { label: 'Cấp độ', value: childWallet.levelName, icon: <School sx={{ fontSize: 16 }} /> } : null,
                          childWallet.schoolName ? { label: 'Trường', value: childWallet.schoolName, icon: <Business sx={{ fontSize: 16 }} /> } : null,
                          childWallet.branchName ? { label: 'Chi nhánh', value: childWallet.branchName, icon: <Business sx={{ fontSize: 16 }} /> } : null
                        ].filter(Boolean).map((info, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              paddingBottom: index < 2 ? 1 : 0,
                              borderBottom: index < 2 ? '1px solid var(--border-light)' : 'none'
                            }}
                          >
                            <Box sx={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', minWidth: 20 }}>
                              {info.icon}
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-family)',
                                fontWeight: 'var(--font-weight-medium)',
                                marginRight: 1
                              }}
                            >
                              {info.label}:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-family)',
                                fontWeight: 'var(--font-weight-semibold)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1
                              }}
                            >
                              {info.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>

              {/* Right: Transfer Form Sidebar */}
              <Paper
                elevation={0}
                sx={{
                  padding: 3,
                  backgroundColor: 'var(--bg-primary)',
                  border: '2px solid var(--color-primary-50)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-md)',
                  position: 'sticky',
                  top: 24,
                  height: 'fit-content',
                  maxHeight: 'calc(100vh - 48px)',
                  overflowY: 'auto'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2.5 }}>
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
                    <Send sx={{ color: 'var(--color-primary)', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'var(--font-family-heading)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--text-primary)',
                        marginBottom: 0.5
                      }}
                    >
                      Chuyển tiền
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      Từ ví chính sang ví con
                    </Typography>
                  </Box>
                </Box>

                <Box component="form" onSubmit={handleTransfer} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel id="student-select-label">Chọn con</InputLabel>
                    <Select
                      labelId="student-select-label"
                      id="student-select"
                      value={transferForm.toStudentId}
                      label="Chọn con"
                      onChange={(e) => setTransferForm((prev) => ({
                        ...prev,
                        toStudentId: e.target.value
                      }))}
                      disabled={isTransferring || childWallets.length === 0}
                      sx={{
                        borderRadius: 'var(--radius-lg)',
                        fontFamily: 'var(--font-family)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--border-light)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--color-primary)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--color-primary)',
                          borderWidth: '2px'
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Chọn con --</em>
                      </MenuItem>
                      {childWallets.map((child) => (
                        <MenuItem key={child.studentId} value={child.studentId}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)' }}>
                              {child.studentName}
                            </Typography>
                            <Chip
                              label={formatCurrency(child.balance)}
                              size="small"
                              sx={{
                                backgroundColor: 'var(--color-primary-50)',
                                color: 'var(--color-primary-dark)',
                                fontFamily: 'var(--font-family)',
                                fontWeight: 'var(--font-weight-semibold)',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth required>
                    <TextField
                      label="Số tiền (VND)"
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm((prev) => ({
                        ...prev,
                        amount: e.target.value
                      }))}
                      disabled={isTransferring}
                      placeholder="Ví dụ: 500000"
                      inputProps={{
                        min: 1000,
                        step: 1000
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MoneyIcon sx={{ color: 'var(--text-secondary)', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                              VND
                            </Typography>
                          </InputAdornment>
                        )
                      }}
                      helperText="Tối thiểu: 1.000 VND"
                      sx={{
                        fontFamily: 'var(--font-family)',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 'var(--radius-lg)',
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
                  </FormControl>

                  <FormControl fullWidth>
                    <TextField
                      label="Ghi chú (tùy chọn)"
                      multiline
                      rows={2}
                      value={transferForm.note}
                      onChange={(e) => setTransferForm((prev) => ({
                        ...prev,
                        note: e.target.value
                      }))}
                      disabled={isTransferring}
                      placeholder="Ví dụ: Tiền ăn vặt tuần này"
                      sx={{
                        fontFamily: 'var(--font-family)',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 'var(--radius-lg)',
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
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isTransferring || childWallets.length === 0 || !transferForm.toStudentId || !transferForm.amount}
                    startIcon={isTransferring ? <CircularProgress size={18} /> : <Send />}
                    sx={{
                      background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)',
                      fontWeight: 'var(--font-weight-semibold)',
                      textTransform: 'none',
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px 24px',
                      boxShadow: 'var(--shadow-md)',
                      marginTop: 1,
                      '&:hover': {
                        background: 'linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 100%)',
                        boxShadow: 'var(--shadow-lg)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        opacity: 0.6,
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    {isTransferring ? 'Đang chuyển...' : 'Chuyển tiền'}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              padding: 4,
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <Wallet sx={{ fontSize: 64, color: 'var(--text-tertiary)', marginBottom: 2, opacity: 0.5 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 1
              }}
            >
              Chưa có ví tiêu vặt nào
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Thêm con và tạo ví để quản lý chi tiêu.
            </Typography>
          </Paper>
        )}
      </div>
    </motion.div>
  );
};

export default ChildrenWallet;

