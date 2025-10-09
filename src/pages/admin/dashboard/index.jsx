import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Tổng User',
      value: '1,234',
      icon: PeopleIcon,
      color: 'primary'
    },
    {
      title: 'Khóa học',
      value: '56',
      icon: SchoolIcon,
      color: 'success'
    },
    {
      title: 'Báo cáo',
      value: '12',
      icon: AssessmentIcon,
      color: 'info'
    },
    {
      title: 'Tăng trưởng',
      value: '+12%',
      icon: TrendingUpIcon,
      color: 'warning'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Dashboard Admin
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      <Icon sx={{ fontSize: 40, color: `${stat.color}.main` }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê User theo tháng
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Biểu đồ sẽ được thêm vào đây
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User mới nhất
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Danh sách user mới sẽ được thêm vào đây
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
