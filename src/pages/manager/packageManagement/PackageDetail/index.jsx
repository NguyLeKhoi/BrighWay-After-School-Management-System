import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Alert,
  Typography,
  Button,
  Divider,
  Paper,
  Chip,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  ArrowBack,
  ShoppingCart,
  Business,
  School,
  AttachMoney,
  CalendarToday,
  CardGiftcard,
  Description,
  AccessTime
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import packageService from '../../../../services/package.service';
import { useApp } from '../../../../contexts/AppContext';
import styles from './PackageDetail.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showGlobalError } = useApp();
  
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


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

        const packageInfo = await packageService.getPackageById(id);
        setPackageData(packageInfo);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin gói bán';
        setError(errorMessage);
        showGlobalError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, showGlobalError]);

  const handleBack = () => {
    navigate('/manager/packages');
  };

  if (loading) {
    return (
      <ContentLoading isLoading={true} text="Đang tải thông tin gói bán..." />
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
            {error || 'Không tìm thấy thông tin gói bán'}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        {/* Header */}
        <Paper 
          elevation={0}
          sx={{
            padding: 3,
            marginBottom: 3,
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              variant="contained"
              sx={{
                borderRadius: 'var(--radius-lg)',
                textTransform: 'none',
                fontFamily: 'var(--font-family)',
                background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                boxShadow: 'var(--shadow-sm)',
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 100%)',
                  boxShadow: 'var(--shadow-md)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Quay lại
            </Button>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{
                fontFamily: 'var(--font-family-heading)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-primary)',
                flex: 1
              }}
            >
              Chi tiết Gói Bán
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Thông tin Gói Bán
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <ShoppingCart sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Tên Gói
                      </Typography>
                      <Typography variant="h6" fontWeight="medium">
                        {packageData.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {packageData.desc && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Description sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                            Mô Tả
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" sx={{ whiteSpace: 'pre-wrap' }}>
                            {packageData.desc || 'Chưa có mô tả'}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider />
                    </>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AttachMoney sx={{ color: 'var(--text-secondary)', fontSize: 24 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Giá
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(packageData.price || 0)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarToday sx={{ color: 'var(--text-secondary)', fontSize: 24 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Thời Hạn
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {packageData.durationInMonths || 0} tháng
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Tổng Số Slot
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {packageData.totalSlots || 0} slot
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Trạng Thái
                      </Typography>
                      <Chip
                        label={packageData.isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
                        color={packageData.isActive !== false ? 'success' : 'default'}
                        size="small"
                        sx={{ width: 'fit-content' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Chi Nhánh
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {packageData.branch?.branchName || packageData.branchName || 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {packageData.studentLevel && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Cấp Độ Học Sinh
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {packageData.studentLevel?.name || packageData.studentLevelName || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Lợi Ích
                </Typography>
                {packageData.benefits && packageData.benefits.length > 0 ? (
                  <List dense>
                    {packageData.benefits.map((benefit) => (
                      <ListItem key={benefit.id || benefit.benefitId} sx={{ px: 0 }}>
                        <CardGiftcard sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <ListItemText
                          primary={benefit.name || 'N/A'}
                          secondary={benefit.description || ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có lợi ích nào được gán
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Loại Ca Giữ Trẻ
                </Typography>
                {packageData.slotTypes && packageData.slotTypes.length > 0 ? (
                  <List dense>
                    {packageData.slotTypes.map((slotType) => (
                      <ListItem key={slotType.id || slotType.slotTypeId} sx={{ px: 0 }}>
                        <AccessTime sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <ListItemText
                          primary={slotType.name || 'N/A'}
                          secondary={slotType.description || ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có loại ca giữ trẻ nào được gán
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default PackageDetail;

