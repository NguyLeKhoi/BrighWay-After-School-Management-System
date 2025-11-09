import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import {
  People as PeopleIcon,
  FamilyRestroom as FamilyIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import userService from '../../../services/user.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import styles from './dashboard.module.css';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
    totalFamilies: 0
  });
  const { isLoading, showLoading, hideLoading } = useLoading();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    showLoading();
    try {
      // Get users with pagination to count total
      const response = await userService.getUsersPagedByRole({
        pageIndex: 1,
        pageSize: 1,
        Role: 'User'
      });

      const totalUsers = response.totalCount || 0;

      // Get all users to calculate stats
      const allUsersResponse = await userService.getUsersPagedByRole({
        pageIndex: 1,
        pageSize: totalUsers > 0 ? totalUsers : 100,
        Role: 'User'
      });

      const users = allUsersResponse.items || allUsersResponse || [];
      
      // Calculate stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const newUsersThisMonth = users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= firstDayOfMonth;
      }).length;

      // Count families (users with family info)
      const totalFamilies = users.filter(user => user.family).length;

      setStats({
        totalUsers: totalUsers,
        newUsersThisMonth: newUsersThisMonth,
        activeUsers: users.length,
        totalFamilies: totalFamilies
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      hideLoading();
    }
  };

  const statCards = [
    {
      title: 'Tổng Người Dùng',
      value: stats.totalUsers.toLocaleString('vi-VN'),
      icon: <PeopleIcon />,
      color: '#1976d2',
      description: 'Tổng số tài khoản User'
    },
    {
      title: 'Người Dùng Mới (Tháng này)',
      value: stats.newUsersThisMonth.toLocaleString('vi-VN'),
      icon: <PersonAddIcon />,
      color: '#2e7d32',
      description: 'Số tài khoản mới trong tháng'
    },
    {
      title: 'Tài Khoản Gia Đình',
      value: stats.totalFamilies.toLocaleString('vi-VN'),
      icon: <FamilyIcon />,
      color: '#f57c00',
      description: 'Số tài khoản có thông tin gia đình'
    },
    {
      title: 'Người Dùng Hoạt Động',
      value: stats.activeUsers.toLocaleString('vi-VN'),
      icon: <TrendingUpIcon />,
      color: '#7b1fa2',
      description: 'Số người dùng đang hoạt động'
    }
  ];

  return (
    <>
      {isLoading && <Loading />}
      <div className={styles.container}>
        <div className={styles.header}>
          <Typography variant="h4" className={styles.title}>
            Dashboard Staff
          </Typography>
          <Typography variant="body1" className={styles.subtitle}>
            Chào mừng đến với trang quản lý của Staff
          </Typography>
        </div>

        <Grid container spacing={3} className={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className={styles.statCard}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" style={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: `${stat.color}15`,
                        borderRadius: '50%',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box sx={{ color: stat.color, fontSize: 32 }}>
                        {stat.icon}
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper className={styles.infoCard} sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Thông tin hệ thống
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đây là trang dashboard dành cho Staff. Tại đây bạn có thể quản lý tài khoản người dùng (User),
            tạo và cập nhật tài khoản gia đình, xem thống kê và thực hiện các tác vụ quản lý khác.
          </Typography>
        </Paper>
      </div>
    </>
  );
};

export default StaffDashboard;
