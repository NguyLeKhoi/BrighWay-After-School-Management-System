import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActionArea,
  Avatar
} from '@mui/material';
import {
  ChildCare as ChildIcon,
  Inventory as PackageIcon,
  ArrowForward
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import studentService from '../../../../services/student.service';
import { useApp } from '../../../../contexts/AppContext';
import useContentLoading from '../../../../hooks/useContentLoading';
import styles from '../Management.module.css';

const PackageSelect = () => {
  const navigate = useNavigate();
  const { showGlobalError } = useApp();
  const { isLoading, showLoading, hideLoading } = useContentLoading();
  const [children, setChildren] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      showLoading();
      setError(null);
      const response = await studentService.getMyChildren();
      const childrenArray = Array.isArray(response) ? response : (Array.isArray(response?.items) ? response.items : []);
      setChildren(childrenArray);
      
      if (childrenArray.length === 0) {
        setError('Bạn chưa có con nào. Vui lòng thêm con trước.');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách con';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  const handleSelectChild = (childId) => {
    navigate(`/family/management/packages/${childId}`);
  };

  if (isLoading) {
    return <ContentLoading isLoading={true} text="Đang tải danh sách con..." />;
  }

  return (
    <motion.div
      className={styles.managementPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.container}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--color-secondary-50) 0%, var(--color-secondary-100) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PackageIcon sx={{ color: 'var(--color-secondary)', fontSize: 32 }} />
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
              Chọn con để mua gói
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Vui lòng chọn một trong các con của bạn để mua gói học tập
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ marginBottom: 3 }}>
            {error}
          </Alert>
        )}

        {children.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3
            }}
          >
            {children.map((child) => (
              <Card
                key={child.id}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                elevation={0}
                sx={{
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  transition: 'all var(--transition-base)',
                  '&:hover': {
                    borderColor: 'var(--color-secondary)',
                    boxShadow: 'var(--shadow-md)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardActionArea onClick={() => handleSelectChild(child.id)}>
                  <CardContent sx={{ padding: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'var(--color-secondary-100)',
                          color: 'var(--color-secondary)',
                          fontSize: 32,
                          fontWeight: 'var(--font-weight-bold)'
                        }}
                      >
                        {child.name?.[0]?.toUpperCase() || child.userName?.[0]?.toUpperCase() || 'C'}
                      </Avatar>
                      <Box sx={{ textAlign: 'center', width: '100%' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'var(--font-family-heading)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--text-primary)',
                            marginBottom: 0.5
                          }}
                        >
                          {child.name || child.userName || 'Chưa có tên'}
                        </Typography>
                        {child.branchName && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--text-secondary)',
                              fontFamily: 'var(--font-family)'
                            }}
                          >
                            {child.branchName}
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'var(--color-secondary)',
                          marginTop: 1
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'var(--font-family)',
                            fontWeight: 'var(--font-weight-semibold)'
                          }}
                        >
                          Mua gói
                        </Typography>
                        <ArrowForward sx={{ fontSize: 18 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </div>
    </motion.div>
  );
};

export default PackageSelect;

