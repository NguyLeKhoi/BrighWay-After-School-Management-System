import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Pagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid
} from '@mui/material';
import {
  History,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AccountBalanceWallet,
  SwapHoriz,
  Inventory,
  Restaurant,
  SportsEsports,
  LocalOffer,
  School,
  Refresh,
  FilterList,
  Close,
  CalendarToday,
  Person,
  AttachMoney,
  Description,
  Receipt
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import { useApp } from '../../../../contexts/AppContext';
import useContentLoading from '../../../../hooks/useContentLoading';
import transactionService from '../../../../services/transaction.service';
import styles from '../Finance.module.css';

const TRANSACTION_TYPES = {
  OrderPayment: { label: 'Thanh toán dịch vụ bổ sung', icon: ShoppingCart, color: 'primary' },
  Deposit: { label: 'Nạp tiền', icon: TrendingUp, color: 'success' },
  TransferIn: { label: 'Nhận tiền từ ví chính', icon: SwapHoriz, color: 'success' },
  TransferOut: { label: 'Chuyển tiền ra', icon: SwapHoriz, color: 'warning' },
  PackagePayment: { label: 'Mua gói học', icon: Inventory, color: 'primary' },
  Refund: { label: 'Hoàn tiền gói học', icon: TrendingUp, color: 'success' },
  Tuition: { label: 'Thanh toán học phí', icon: School, color: 'primary' },
  Canteen: { label: 'Mua đồ ăn', icon: Restaurant, color: 'info' },
  Game: { label: 'Thanh toán game', icon: SportsEsports, color: 'secondary' },
  ServicePurchase: { label: 'Mua dịch vụ bổ sung', icon: LocalOffer, color: 'primary' }
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0
  });
  
  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Detail Dialog
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { showGlobalError } = useApp();
  const { isLoading: isPageLoading, showLoading, hideLoading } = useContentLoading();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Math.abs(amount || 0));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const getTransactionTypeInfo = (type) => {
    return TRANSACTION_TYPES[type] || {
      label: type || 'Không xác định',
      icon: History,
      color: 'default'
    };
  };

  const getWalletTypeLabel = (walletType) => {
    if (!walletType) return 'N/A';
    return walletType === 'Parent' ? 'Ví chính' : 'Ví con';
  };

  const loadTransactions = async (pageIndex = 1, pageSize = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        pageIndex,
        pageSize
      };

      if (filterType) {
        params.type = filterType;
      }
      if (filterFromDate) {
        // Convert date string (YYYY-MM-DD) to ISO string with time
        const fromDate = new Date(filterFromDate + 'T00:00:00');
        params.fromDate = fromDate.toISOString();
      }
      if (filterToDate) {
        // Convert date string (YYYY-MM-DD) to ISO string with end of day
        const toDate = new Date(filterToDate + 'T23:59:59');
        params.toDate = toDate.toISOString();
      }

      const response = await transactionService.getMyTransactions(params);

      const items = response.items || [];
      setTransactions(items);
      
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
      
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    showLoading();
    loadTransactions(1, 10).finally(() => {
      hideLoading();
    });
  }, []);

  const handlePageChange = (event, newPage) => {
    loadTransactions(newPage, pagination.pageSize);
  };

  const handleFilterChange = () => {
    loadTransactions(1, pagination.pageSize);
  };

  const handleResetFilters = () => {
    setFilterType('');
    setFilterFromDate('');
    setFilterToDate('');
    setTimeout(() => {
      loadTransactions(1, pagination.pageSize);
    }, 100);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedTransaction(null);
  };

  const renderTransactionDetails = (transaction) => {
    if (!transaction) return null;

    const typeInfo = getTransactionTypeInfo(transaction.type);
    const IconComponent = typeInfo.icon;
    const isPositive = (transaction.amount || 0) > 0;
    const amount = Math.abs(transaction.amount || 0);

    return (
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: typeInfo.color === 'primary' 
                ? 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)'
                : typeInfo.color === 'secondary'
                ? 'linear-gradient(135deg, var(--color-secondary-50) 0%, var(--color-secondary-light) 100%)'
                : typeInfo.color === 'success'
                ? 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)'
                : typeInfo.color === 'error'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%)'
                : typeInfo.color === 'warning'
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.2) 100%)'
                : typeInfo.color === 'info'
                ? 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)'
                : 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconComponent 
              sx={{ 
                color: typeInfo.color === 'primary' 
                  ? 'var(--color-primary)'
                  : typeInfo.color === 'secondary'
                  ? 'var(--color-secondary)'
                  : typeInfo.color === 'success'
                  ? 'var(--color-success)'
                  : typeInfo.color === 'error'
                  ? 'var(--color-error)'
                  : typeInfo.color === 'warning'
                  ? 'var(--color-warning)'
                  : typeInfo.color === 'info'
                  ? 'var(--color-info)'
                  : 'var(--text-secondary)',
                fontSize: 28 
              }} 
            />
          </Box>
          <Box flex={1}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {typeInfo.label}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label={getWalletTypeLabel(transaction.walletType)}
                size="small"
                variant="outlined"
              />
              <Chip
                label={isPositive ? 'Tiền vào' : 'Tiền ra'}
                size="small"
                color={isPositive ? 'success' : 'error'}
              />
            </Box>
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {isPositive ? '+' : '-'} {formatCurrency(amount)}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Basic Info */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarToday sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Thời gian
              </Typography>
            </Box>
            <Typography variant="body1">
              {formatDate(transaction.timestamp)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Receipt sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Mã giao dịch
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {transaction.id || 'N/A'}
            </Typography>
          </Grid>
          {transaction.description && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Description sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Mô tả
                </Typography>
              </Box>
              <Typography variant="body1">
                {transaction.description}
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Type-specific Details */}
        {transaction.type === 'PackagePayment' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Thông tin gói
            </Typography>
            <Grid container spacing={2}>
              {transaction.packageName && (
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Inventory sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Tên gói
                    </Typography>
                  </Box>
                  <Typography variant="body1">{transaction.packageName}</Typography>
                </Grid>
              )}
              {transaction.packagePrice !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AttachMoney sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Giá gói
                    </Typography>
                  </Box>
                  <Typography variant="body1">{formatCurrency(transaction.packagePrice)}</Typography>
                </Grid>
              )}
              {transaction.packageTotalSlot !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Tổng số slot
                  </Typography>
                  <Typography variant="body1">{transaction.packageTotalSlot} slot</Typography>
                </Grid>
              )}
              {transaction.packageUsedSlot !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Slot đã dùng
                  </Typography>
                  <Typography variant="body1">{transaction.packageUsedSlot} slot</Typography>
                </Grid>
              )}
              {transaction.packageStartDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Ngày bắt đầu
                  </Typography>
                  <Typography variant="body1">{formatDateOnly(transaction.packageStartDate)}</Typography>
                </Grid>
              )}
              {transaction.packageEndDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Ngày kết thúc
                  </Typography>
                  <Typography variant="body1">{formatDateOnly(transaction.packageEndDate)}</Typography>
                </Grid>
              )}
              {transaction.packageStudentName && (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Học sinh
                    </Typography>
                  </Box>
                  <Typography variant="body1">{transaction.packageStudentName}</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {transaction.type === 'OrderPayment' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Thông tin đơn hàng
            </Typography>
            <Grid container spacing={2}>
              {transaction.orderId && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Mã đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {transaction.orderId}
                  </Typography>
                </Grid>
              )}
              {transaction.orderReference && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Mã tham chiếu
                  </Typography>
                  <Typography variant="body1">{transaction.orderReference}</Typography>
                </Grid>
              )}
              {transaction.orderStatus && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Trạng thái
                  </Typography>
                  <Chip
                    label={transaction.orderStatus}
                    size="small"
                    color={
                      transaction.orderStatus?.toLowerCase() === 'completed' ? 'success' :
                      transaction.orderStatus?.toLowerCase() === 'pending' ? 'warning' : 'default'
                    }
                  />
                </Grid>
              )}
              {transaction.orderCreatedDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Ngày tạo đơn
                  </Typography>
                  <Typography variant="body1">{formatDate(transaction.orderCreatedDate)}</Typography>
                </Grid>
              )}
              {transaction.orderServiceNames && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Dịch vụ
                  </Typography>
                  <Typography variant="body1">{transaction.orderServiceNames}</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {transaction.type === 'Deposit' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Thông tin nạp tiền
            </Typography>
            <Grid container spacing={2}>
              {transaction.payOSOrderCode && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Mã đơn PayOS
                  </Typography>
                  <Typography variant="body1">{transaction.payOSOrderCode}</Typography>
                </Grid>
              )}
              {transaction.payOSTransactionId && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Mã giao dịch PayOS
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {transaction.payOSTransactionId}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {transaction.type === 'Refund' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Thông tin hoàn tiền
            </Typography>
            <Grid container spacing={2}>
              {transaction.refundReason && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Lý do hoàn tiền
                  </Typography>
                  <Typography variant="body1">{transaction.refundReason}</Typography>
                </Grid>
              )}
              {transaction.refundPercentage !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Tỷ lệ hoàn tiền
                  </Typography>
                  <Typography variant="body1">{transaction.refundPercentage}%</Typography>
                </Grid>
              )}
              {transaction.refundedAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Ngày hoàn tiền
                  </Typography>
                  <Typography variant="body1">{formatDate(transaction.refundedAt)}</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {transaction.note && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Description sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Ghi chú
              </Typography>
            </Box>
            <Typography variant="body1">{transaction.note}</Typography>
          </>
        )}
      </Box>
    );
  };

  if (isPageLoading) {
    return <ContentLoading />;
  }

  return (
    <motion.div 
      className={styles.financePage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.container}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" className={styles.title} sx={{ margin: 0 }}>
            Lịch sử giao dịch
          </Typography>
          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
              sx={{
                border: '1px solid var(--border-light)',
                '&:hover': {
                  backgroundColor: 'var(--bg-tertiary)'
                }
              }}
            >
              <FilterList />
            </IconButton>
            <IconButton
              onClick={() => loadTransactions(pagination.pageIndex, pagination.pageSize)}
              sx={{
                border: '1px solid var(--border-light)',
                '&:hover': {
                  backgroundColor: 'var(--bg-tertiary)'
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Loại giao dịch</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                  }}
                  label="Loại giao dịch"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Object.entries(TRANSACTION_TYPES).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Từ ngày"
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ minWidth: 200 }}
              />
              <TextField
                label="Đến ngày"
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ minWidth: 200 }}
              />

              <Box display="flex" gap={1}>
                <IconButton
                  onClick={handleFilterChange}
                  variant="contained"
                  sx={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'var(--color-primary-dark)'
                    }
                  }}
                >
                  <FilterList />
                </IconButton>
                <IconButton
                  onClick={handleResetFilters}
                  sx={{
                    border: '1px solid var(--border-light)',
                    '&:hover': {
                      backgroundColor: 'var(--bg-tertiary)'
                    }
                  }}
                >
                  <Refresh />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Error State */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: 'var(--color-error-50)',
              border: '1px solid var(--color-error-100)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* Transactions List */}
        {isLoading && transactions.length === 0 ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-xl)'
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
              Lịch sử giao dịch sẽ hiển thị ở đây khi có giao dịch.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Pagination - Top */}
            {pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {transactions.length} / {pagination.totalCount} giao dịch
                </Typography>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.pageIndex}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            <Box display="flex" flexDirection="column" gap={2} mb={3}>
              {transactions.map((transaction) => {
                const typeInfo = getTransactionTypeInfo(transaction.type);
                const IconComponent = typeInfo.icon;
                const isPositive = (transaction.amount || 0) > 0;
                const amount = Math.abs(transaction.amount || 0);

                return (
                  <Paper
                    key={transaction.id}
                    elevation={0}
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleTransactionClick(transaction)}
                    sx={{
                      p: 3,
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'var(--color-primary)',
                        boxShadow: 'var(--shadow-md)',
                        transform: 'translateY(-2px)',
                        backgroundColor: 'var(--bg-primary)'
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 'var(--radius-lg)',
                          background: typeInfo.color === 'primary' 
                            ? 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)'
                            : typeInfo.color === 'secondary'
                            ? 'linear-gradient(135deg, var(--color-secondary-50) 0%, var(--color-secondary-light) 100%)'
                            : typeInfo.color === 'success'
                            ? 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)'
                            : typeInfo.color === 'error'
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%)'
                            : typeInfo.color === 'warning'
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.2) 100%)'
                            : typeInfo.color === 'info'
                            ? 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)'
                            : 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: 'var(--shadow-xs)'
                        }}
                      >
                        <IconComponent 
                          sx={{ 
                            color: typeInfo.color === 'primary' 
                              ? 'var(--color-primary)'
                              : typeInfo.color === 'secondary'
                              ? 'var(--color-secondary)'
                              : typeInfo.color === 'success'
                              ? 'var(--color-success)'
                              : typeInfo.color === 'error'
                              ? 'var(--color-error)'
                              : typeInfo.color === 'warning'
                              ? 'var(--color-warning)'
                              : typeInfo.color === 'info'
                              ? 'var(--color-info)'
                              : 'var(--text-secondary)',
                            fontSize: 28 
                          }} 
                        />
                      </Box>

                      {/* Transaction Info */}
                      <Box flex={1} minWidth={0}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={1.5} flexWrap="wrap">
                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.125rem' }}>
                            {typeInfo.label}
                          </Typography>
                          <Chip
                            label={getWalletTypeLabel(transaction.walletType)}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.75rem',
                              height: 24,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <CalendarToday sx={{ fontSize: 16, color: 'var(--text-tertiary)' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {formatDate(transaction.timestamp)}
                          </Typography>
                        </Box>
                        {transaction.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: '0.875rem', 
                              mt: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {transaction.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Amount */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          flexShrink: 0,
                          minWidth: '120px'
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          {isPositive ? (
                            <TrendingUp sx={{ color: 'var(--color-success)', fontSize: 22 }} />
                          ) : (
                            <TrendingDown sx={{ color: 'var(--color-error)', fontSize: 22 }} />
                          )}
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                              color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
                              fontSize: '1.25rem'
                            }}
                          >
                            {isPositive ? '+' : '-'} {formatCurrency(amount)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--text-tertiary)',
                            fontSize: '0.75rem',
                            mt: 0.5
                          }}
                        >
                          {isPositive ? 'Tiền vào' : 'Tiền ra'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            {/* Pagination - Bottom */}
            {pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {transactions.length} / {pagination.totalCount} giao dịch
                </Typography>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.pageIndex}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            {/* Total Count - Only show if no pagination */}
            {pagination.totalPages <= 1 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {transactions.length} / {pagination.totalCount} giao dịch
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-xl)',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Chi tiết giao dịch
              </Typography>
              <IconButton
                onClick={handleCloseDetailDialog}
                size="small"
                sx={{
                  color: 'var(--text-secondary)',
                  '&:hover': {
                    backgroundColor: 'var(--bg-tertiary)'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {renderTransactionDetails(selectedTransaction)}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDetailDialog}
              variant="contained"
              sx={{
                backgroundColor: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-dark)'
                }
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default TransactionHistory;
