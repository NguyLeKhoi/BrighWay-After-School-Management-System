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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Báo cáo & Thống kê
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
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
          >
            Xuất báo cáo
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng User
                  </Typography>
                  <Typography variant="h4">
                    1,234
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +12% so với tháng trước
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Khóa học
                  </Typography>
                  <Typography variant="h4">
                    56
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +8% so với tháng trước
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Doanh thu
                  </Typography>
                  <Typography variant="h4">
                    $12,345
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +15% so với tháng trước
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Tỷ lệ hoàn thành
                  </Typography>
                  <Typography variant="h4">
                    85%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +5% so với tháng trước
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ thống kê theo thời gian
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Biểu đồ sẽ được tích hợp ở đây
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top khóa học phổ biến
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Danh sách top khóa học sẽ được hiển thị ở đây
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
