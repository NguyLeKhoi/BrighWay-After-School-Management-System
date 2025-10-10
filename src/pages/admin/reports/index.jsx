import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import styles from './Reports.module.css';

const Reports = () => {
  const reportTypes = [
    {
      id: 'user-report',
      name: 'Báo cáo User',
      description: 'Thống kê chi tiết về người dùng',
      icon: PeopleIcon,
      color: 'primary'
    },
    {
      id: 'course-report',
      name: 'Báo cáo Khóa học',
      description: 'Thống kê về các khóa học',
      icon: SchoolIcon,
      color: 'success'
    },
    {
      id: 'revenue-report',
      name: 'Báo cáo Doanh thu',
      description: 'Thống kê doanh thu theo thời gian',
      icon: TrendingUpIcon,
      color: 'warning'
    },
    {
      id: 'general-report',
      name: 'Báo cáo Tổng quan',
      description: 'Báo cáo tổng quan hệ thống',
      icon: AssessmentIcon,
      color: 'info'
    }
  ];

  const getColor = (color) => {
    return `${color}.main`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Báo cáo & Thống kê
        </h1>
        <p className={styles.subtitle}>
          Tổng quan và phân tích dữ liệu hệ thống
        </p>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.filterContainer}>
          <FormControl className={styles.formControl}>
            <InputLabel>Thời gian</InputLabel>
            <Select
              value="this-month"
              label="Thời gian"
            >
              <MenuItem value="this-week">Tuần này</MenuItem>
              <MenuItem value="this-month">Tháng này</MenuItem>
              <MenuItem value="this-quarter">Quý này</MenuItem>
              <MenuItem value="this-year">Năm nay</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            className={styles.exportButton}
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>
              Tổng User
            </span>
            <div className={`${styles.statIcon} ${styles.primary}`}>
              <PeopleIcon />
            </div>
          </div>
          <p className={styles.statValue}>
            1,234
          </p>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <TrendingUpIcon fontSize="small" />
            +12% so với tháng trước
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>
              Khóa học
            </span>
            <div className={`${styles.statIcon} ${styles.success}`}>
              <SchoolIcon />
            </div>
          </div>
          <p className={styles.statValue}>
            56
          </p>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <TrendingUpIcon fontSize="small" />
            +8% so với tháng trước
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>
              Doanh thu
            </span>
            <div className={`${styles.statIcon} ${styles.warning}`}>
              <TrendingUpIcon />
            </div>
          </div>
          <p className={styles.statValue}>
            $12,345
          </p>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <TrendingUpIcon fontSize="small" />
            +15% so với tháng trước
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>
              Tỷ lệ hoàn thành
            </span>
            <div className={`${styles.statIcon} ${styles.primary}`}>
              <AssessmentIcon />
            </div>
          </div>
          <p className={styles.statValue}>
            85%
          </p>
          <div className={`${styles.statChange} ${styles.positive}`}>
            <TrendingUpIcon fontSize="small" />
            +5% so với tháng trước
          </div>
        </div>
      </div>

      {/* Report Types */}
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Các loại báo cáo
      </Typography>
      
      <Grid container spacing={3}>
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={report.id}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Icon 
                    sx={{ 
                      fontSize: 48, 
                      color: getColor(report.color),
                      mb: 2 
                    }} 
                  />
                  <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                    {report.name}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    {report.description}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    startIcon={<DownloadIcon />}
                  >
                    Tạo báo cáo
                  </Button>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Charts Placeholder */}
      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            Biểu đồ thống kê theo thời gian
          </h3>
          <div className={styles.chartContent}>
            Biểu đồ sẽ được tích hợp ở đây
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            Top khóa học phổ biến
          </h3>
          <div className={styles.chartContent}>
            Danh sách top khóa học sẽ được hiển thị ở đây
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
