import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Divider,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  ArrowBack,
  Business,
  LocationOn,
  Phone,
  School,
  Grade,
  LocalOffer
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import branchService from '../../../../services/branch.service';
import { useApp } from '../../../../contexts/AppContext';
import styles from './BranchDetail.module.css';

// Convert numeric status to string enum
const convertStatusToEnum = (status) => {
  const statusMap = {
    0: 'Active',
    1: 'Active',
    2: 'Inactive',
    3: 'UnderMaintenance',
    4: 'Closed',
    '0': 'Active',
    '1': 'Active',
    '2': 'Inactive',
    '3': 'UnderMaintenance',
    '4': 'Closed',
    'Active': 'Active',
    'Inactive': 'Inactive',
    'UnderMaintenance': 'UnderMaintenance',
    'Closed': 'Closed'
  };
  
  if (typeof status === 'string' && ['Active', 'Inactive', 'UnderMaintenance', 'Closed'].includes(status)) {
    return status;
  }
  
  return statusMap[status] || 'Active';
};

const BranchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showGlobalError } = useApp();
  
  const [branch, setBranch] = useState(null);
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

        const branchData = await branchService.getBranchById(id);
        setBranch(branchData);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin chi nhánh';
        setError(errorMessage);
        showGlobalError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, showGlobalError]);

  const handleBack = () => {
    navigate('/admin/branches');
  };

  const handleEdit = () => {
    navigate(`/admin/branches/update/${id}`);
  };

  if (loading) {
    return (
      <ContentLoading isLoading={true} text="Đang tải thông tin chi nhánh..." />
    );
  }

  if (error || !branch) {
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
            {error || 'Không tìm thấy thông tin chi nhánh'}
          </Alert>
        </div>
      </div>
    );
  }

  const status = convertStatusToEnum(branch.status);
  const statusLabels = {
    'Active': 'Hoạt động',
    'Inactive': 'Không hoạt động',
    'UnderMaintenance': 'Đang bảo trì',
    'Closed': 'Đã đóng'
  };
  const statusColors = {
    'Active': 'success',
    'Inactive': 'default',
    'UnderMaintenance': 'warning',
    'Closed': 'error'
  };
  const fullAddress = [branch.address, branch.districtName, branch.provinceName]
    .filter(Boolean)
    .join(', ');

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
              Chi tiết Chi Nhánh
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEdit}
              sx={{
                borderRadius: 'var(--radius-lg)',
                textTransform: 'none',
                fontFamily: 'var(--font-family)'
              }}
            >
              Sửa
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Branch Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Thông tin Chi Nhánh
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Business sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Tên Chi Nhánh
                      </Typography>
                      <Typography variant="h6" fontWeight="medium">
                        {branch.branchName || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LocationOn sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Địa Chỉ
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {fullAddress || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone sx={{ color: 'var(--text-secondary)', fontSize: 24 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Số Điện Thoại
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {branch.phone || 'N/A'}
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
                        label={statusLabels[status] || status}
                        color={statusColors[status] || 'default'}
                        size="small"
                        sx={{ width: 'fit-content' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Related Information */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Trường Học
                </Typography>
                {branch.schools && branch.schools.length > 0 ? (
                  <List dense>
                    {branch.schools.map((school) => (
                      <ListItem key={school.id} sx={{ px: 0 }}>
                        <School sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <ListItemText
                          primary={school.name || 'N/A'}
                          secondary={school.address || ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có trường học nào được gán
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Cấp Độ Học Sinh
                </Typography>
                {branch.studentLevels && branch.studentLevels.length > 0 ? (
                  <List dense>
                    {branch.studentLevels.map((level) => (
                      <ListItem key={level.id} sx={{ px: 0 }}>
                        <Grade sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <ListItemText
                          primary={level.name || 'N/A'}
                          secondary={level.description || ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có cấp độ học sinh nào được gán
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

export default BranchDetail;
