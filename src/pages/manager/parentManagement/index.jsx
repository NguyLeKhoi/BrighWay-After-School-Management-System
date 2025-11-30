import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import styles from './parentManagement.module.css';

const ParentManagement = () => {
  const navigate = useNavigate();


  const handleCreateWithOCR = () => {
    navigate('/manager/parents/create?mode=ocr');
  };

  const handleCreateWithManual = () => {
    navigate('/manager/parents/create?mode=manual');
  };
  
  return (
    <div className={styles.container}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontFamily: 'var(--font-family-heading)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)'
          }}
        >
          Tạo Tài Khoản Phụ Huynh
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Chọn phương thức tạo tài khoản phụ huynh
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 'var(--shadow-lg)'
              }
            }}
          >
            <CardActionArea 
              onClick={handleCreateWithOCR}
              sx={{ height: '100%', p: 3 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                  <PhotoCameraIcon 
                    sx={{ 
                      fontSize: 64, 
                      color: 'primary.main',
                      mb: 1
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Sử dụng OCR (Chụp CCCD)
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    Tự động trích xuất thông tin từ ảnh CCCD để tạo tài khoản nhanh chóng và chính xác
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 'var(--shadow-lg)'
              }
            }}
          >
            <CardActionArea 
              onClick={handleCreateWithManual}
              sx={{ height: '100%', p: 3 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                  <EditIcon 
                    sx={{ 
                      fontSize: 64, 
                      color: 'secondary.main',
                      mb: 1
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Nhập Thủ Công
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    Nhập thông tin từng bước bằng form để tạo tài khoản phụ huynh
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ParentManagement;

