import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Alert,
  Typography,
  Button,
  Paper,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { 
  ArrowBack,
  ShoppingCart,
  CheckCircle
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import ManagementFormDialog from '../../../../components/Management/FormDialog';
import packageService from '../../../../services/package.service';
import studentService from '../../../../services/student.service';
import { useApp } from '../../../../contexts/AppContext';
import useContentLoading from '../../../../hooks/useContentLoading';
import styles from './PackageDetail.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const UserPackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showGlobalError, addNotification } = useApp();
  const packageType = searchParams.get('type'); // 'purchased' or 'available'
  
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [children, setChildren] = useState([]);
  const [isBuying, setIsBuying] = useState(false);
  const { showLoading, hideLoading } = useContentLoading();

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Thiếu thông tin cần thiết');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, try to get data from navigation state (passed from list page)
        if (location.state?.packageData) {
          setPackageData(location.state.packageData);
          setLoading(false);
          return;
        }

        // If no state data, we cannot fetch package details for user
        // User should navigate from the list page to ensure data is available
        throw new Error('Không thể tải thông tin gói. Vui lòng quay lại danh sách và click "Xem chi tiết" từ đó.');
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin gói';
        setError(errorMessage);
        showGlobalError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, location.state, showGlobalError]);

  // Load children list
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const childrenList = await studentService.getMyChildren();
        const childrenArray = Array.isArray(childrenList) ? childrenList : [];
        setChildren(childrenArray);
      } catch (err) {
        // Silently fail
        setChildren([]);
      }
    };

    if (packageType === 'available') {
      loadChildren();
    }
  }, [packageType]);

  const handleBack = () => {
    // Route về trang list packages của con đã chọn, hoặc trang chọn con nếu không có childId
    const childId = location.state?.childId;
    if (childId) {
      navigate(`/user/management/packages/${childId}`);
    } else {
      // Nếu không có childId, route về trang chọn con
      navigate('/user/management/packages');
    }
  };

  const handleBuyClick = () => {
    if (packageType === 'available' && packageData) {
      setShowBuyDialog(true);
    }
  };

  const handleBuyPackage = async (studentId) => {
    if (!packageData || !studentId) return;

    setIsBuying(true);
    showLoading();

    try {
      // Always use current date as start date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateISO = today.toISOString();
      
      await packageService.buyPackageForChild({
        packageId: packageData.id,
        studentId: studentId,
        startDate: startDateISO
      });

      addNotification({
        message: 'Mua gói thành công!',
        severity: 'success'
      });

      setShowBuyDialog(false);
      
      // Navigate back to packages list
      navigate('/user/management/packages');
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể mua gói';
      
      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsBuying(false);
      hideLoading();
    }
  };

  if (loading) {
    return (
      <ContentLoading isLoading={true} text="Đang tải thông tin gói..." />
    );
  }

  if (error || !packageData) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.container}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Quay lại
          </Button>
          <Alert severity="error">
            {error || 'Không tìm thấy thông tin gói'}
          </Alert>
        </div>
      </div>
    );
  }

  const statusText = packageData.status === 'active' 
    ? 'Đang sử dụng' 
    : packageData.status === 'inactive' 
      ? 'Tạm dừng' 
      : 'Hoạt động';

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Quay lại
        </Button>

        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flex: 1 }}>
                {packageData.name}
              </Typography>
              <Chip
                label={statusText}
                color={packageData.status === 'active' ? 'success' : 'default'}
                sx={{ ml: 2 }}
              />
            </Box>
            {packageData.desc && (
              <Typography variant="body1" color="text.secondary">
                {packageData.desc}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Package Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Box className={styles.infoItem}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Giá
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  {formatCurrency(packageData.price)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box className={styles.infoItem}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Thời hạn
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {packageData.durationInMonths} tháng
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box className={styles.infoItem}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Số slot
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {packageData.totalSlots || '—'}
                </Typography>
              </Box>
            </Grid>
            
            {packageType === 'purchased' && (
              <>
                {packageData.purchasedDate && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box className={styles.infoItem}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Ngày mua
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(packageData.purchasedDate)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {packageData.expiryDate && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box className={styles.infoItem}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Hết hạn
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(packageData.expiryDate)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {packageData.childName && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box className={styles.infoItem}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Con
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {packageData.childName}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {packageData.usedSlots !== undefined && packageData.totalSlots !== undefined && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box className={styles.infoItem}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Đã dùng
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {packageData.usedSlots}/{packageData.totalSlots} slot
                        {packageData.remainingSlots !== undefined && (
                          <Typography component="span" sx={{ color: 'success.main', ml: 1 }}>
                            (Còn lại: {packageData.remainingSlots} slot)
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </>
            )}

            {packageData.branch && (
              <Grid item xs={12} sm={6} md={4}>
                <Box className={styles.infoItem}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Chi nhánh
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {packageData.branch.branchName || packageData.branch}
                  </Typography>
                </Box>
              </Grid>
            )}
            {packageData.studentLevel && (
              <Grid item xs={12} sm={6} md={4}>
                <Box className={styles.infoItem}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Cấp độ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {packageData.studentLevel.levelName || packageData.studentLevel}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Benefits */}
          {packageData.benefits && packageData.benefits.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Lợi ích
              </Typography>
              <Grid container spacing={2}>
                {packageData.benefits.map((benefit, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2">
                        {benefit.name || benefit}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Action Button */}
          {packageType === 'available' && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCart />}
                onClick={handleBuyClick}
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Đăng ký ngay
              </Button>
            </Box>
          )}
        </Paper>

        {/* Buy Package Dialog */}
        <ManagementFormDialog
          open={showBuyDialog}
          onClose={() => {
            if (!isBuying) {
              setShowBuyDialog(false);
            }
          }}
          mode="create"
          title="Mua gói dịch vụ"
          icon={ShoppingCart}
          loading={isBuying}
          maxWidth="md"
        >
          {packageData && (
            <Box sx={{ 
              mb: 3,
              p: 3,
              backgroundColor: 'rgba(0, 123, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(0, 123, 255, 0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 1,
                color: 'text.primary'
              }}>
                {packageData.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Giá: ${formatCurrency(packageData.price)}`}
                  sx={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                />
                {packageData.durationInMonths && (
                  <Chip 
                    label={`Thời hạn: ${packageData.durationInMonths} tháng`}
                    variant="outlined"
                    sx={{ fontSize: '0.85rem' }}
                  />
                )}
                {packageData.totalSlots && (
                  <Chip 
                    label={`${packageData.totalSlots} slot`}
                    variant="outlined"
                    sx={{ fontSize: '0.85rem' }}
                  />
                )}
              </Box>
            </Box>
          )}

          {(() => {
            // Xác định con được chọn từ location.state hoặc tự động nếu chỉ có 1 con
            const childIdFromState = location.state?.childId;
            const selectedChildId = childIdFromState || (children.length === 1 ? children[0].id : '');
            const selectedChild = children.find(child => child.id === selectedChildId);
            
            if (!selectedChild) {
              return (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Vui lòng chọn con từ trang trước
                </Alert>
              );
            }
            
            return (
              <>
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'var(--bg-secondary)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Mua gói cho:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedChild.name || 'Không tên'}
                  </Typography>
                  {selectedChild.branchName && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Chi nhánh: {selectedChild.branchName}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowBuyDialog(false);
                    }}
                    disabled={isBuying}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleBuyPackage(selectedChildId)}
                    disabled={isBuying}
                    sx={{
                      background: 'var(--color-secondary)',
                      color: 'var(--text-primary)',
                      '&:hover': {
                        background: 'var(--color-secondary-dark)',
                        color: 'var(--text-inverse)'
                      }
                    }}
                  >
                    {isBuying ? 'Đang xử lý...' : 'Xác nhận mua'}
                  </Button>
                </Box>
              </>
            );
          })()}
        </ManagementFormDialog>
      </div>
    </div>
  );
};

export default UserPackageDetail;
