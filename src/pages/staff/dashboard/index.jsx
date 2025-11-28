import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Divider,
  Button,
  Link as MuiLink
} from '@mui/material';
import {
  Event as EventIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Today as TodayIcon,
  VisibilityOff as VisibilityOffIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import activityService from '../../../services/activity.service';
import studentSlotService from '../../../services/studentSlot.service';
import { useLoading } from '../../../hooks/useLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import AnimatedCard from '../../../components/Common/AnimatedCard';
import PageWrapper from '../../../components/Common/PageWrapper';
import { useAuth } from '../../../contexts/AuthContext';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoading, showLoading, hideLoading } = useLoading();
  
  const [stats, setStats] = useState({
    totalActivities: 0,
    activitiesThisMonth: 0,
    totalSlots: 0,
    upcomingSlots: 0,
    studentsToday: 0,
    unviewedActivities: 0,
    activitiesToday: 0,
    completedSlots: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    showLoading();
    try {
      // Load activities
      const activitiesResponse = await activityService.getActivitiesPaged({
        pageIndex: 1,
        pageSize: 100,
        CreatedById: user?.id
      });
      
      const activities = Array.isArray(activitiesResponse?.items) 
        ? activitiesResponse.items 
        : [];
      
      const totalActivities = activitiesResponse?.totalCount || 0;
      
      // Calculate activities this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const activitiesThisMonth = activities.filter(activity => {
        const createdDate = new Date(activity.createdTime || activity.createdDate);
        return createdDate >= firstDayOfMonth;
      }).length;

      // Calculate activities today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activitiesToday = activities.filter(activity => {
        const createdDate = new Date(activity.createdTime || activity.createdDate);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === today.getTime();
      }).length;

      // Count unviewed activities
      const unviewedActivities = activities.filter(
        activity => !activity.isViewed
      ).length;

      // Load student slots
      const slotsResponse = await studentSlotService.getStaffSlots({
        pageIndex: 1,
        pageSize: 100
      });

      const slots = Array.isArray(slotsResponse?.items) 
        ? slotsResponse.items 
        : [];
      
      const totalSlots = slotsResponse?.totalCount || 0;

      // Calculate upcoming slots (from today onwards)
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const upcomingSlots = slots.filter(slot => {
        if (!slot.date) return false;
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate >= todayDate;
      }).length;

      // Calculate students today
      const studentsTodaySet = new Set();
      slots.forEach(slot => {
        if (slot.date) {
          const slotDate = new Date(slot.date);
          slotDate.setHours(0, 0, 0, 0);
          if (slotDate.getTime() === todayDate.getTime() && slot.studentId) {
            studentsTodaySet.add(slot.studentId);
          }
        }
      });
      const studentsToday = studentsTodaySet.size;

      // Calculate completed slots (past slots)
      const completedSlots = slots.filter(slot => {
        if (!slot.date) return false;
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate < todayDate;
      }).length;

      setStats({
        totalActivities,
        activitiesThisMonth,
        totalSlots,
        upcomingSlots,
        studentsToday,
        unviewedActivities,
        activitiesToday,
        completedSlots
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      hideLoading();
    }
  };

  const statCards = [
    {
      title: 'Tổng Hoạt Động',
      value: stats.totalActivities.toLocaleString('vi-VN'),
      icon: <EventIcon />,
      color: '#1976d2',
      description: 'Tổng số hoạt động đã tạo',
      action: () => navigate('/staff/activities')
    },
    {
      title: 'Hoạt Động Tháng Này',
      value: stats.activitiesThisMonth.toLocaleString('vi-VN'),
      icon: <TrendingUpIcon />,
      color: '#2e7d32',
      description: 'Số hoạt động tạo trong tháng',
      action: () => navigate('/staff/activities')
    },
    {
      title: 'Slot Sắp Tới',
      value: stats.upcomingSlots.toLocaleString('vi-VN'),
      icon: <CalendarIcon />,
      color: '#f57c00',
      description: 'Số slot học sắp tới',
      action: () => navigate('/staff/assignments')
    },
    {
      title: 'Học Sinh Hôm Nay',
      value: stats.studentsToday.toLocaleString('vi-VN'),
      icon: <PeopleIcon />,
      color: '#7b1fa2',
      description: 'Số học sinh cần chăm sóc hôm nay',
      action: () => navigate('/staff/assignments')
    }
  ];

  const quickStats = [
    {
      title: 'Hoạt Động Hôm Nay',
      value: stats.activitiesToday,
      icon: <TodayIcon />,
      color: 'primary'
    },
    {
      title: 'Chưa Xem',
      value: stats.unviewedActivities,
      icon: <VisibilityOffIcon />,
      color: 'warning'
    },
    {
      title: 'Tổng Slot',
      value: stats.totalSlots,
      icon: <AssignmentIcon />,
      color: 'info'
    },
    {
      title: 'Đã Hoàn Thành',
      value: stats.completedSlots,
      icon: <CheckCircleIcon />,
      color: 'success'
    }
  ];

  return (
    <PageWrapper>
      {isLoading && <ContentLoading isLoading={isLoading} text="Đang tải thống kê..." />}
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          maxWidth: '1400px',
          margin: '0 auto',
          minHeight: '100vh',
          background: 'var(--bg-secondary)'
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 700,
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-family-heading)',
              mb: 1
            }}
          >
            Dashboard Staff
          </Typography>
          <Typography 
            variant="body1" 
            sx={{
              color: 'text.secondary',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            Chào mừng, {user?.name || 'Staff'}! Tổng quan công việc của bạn
          </Typography>
        </Box>

        {/* Main Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <AnimatedCard delay={index * 0.1}>
                <Card
                  onClick={stat.action}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}88 100%)`
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 'var(--shadow-lg)',
                      borderColor: stat.color
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          gutterBottom
                          sx={{
                            fontFamily: 'var(--font-family-primary)',
                            fontWeight: 500
                          }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography 
                          variant="h4" 
                          fontWeight="bold" 
                          sx={{ 
                            color: stat.color,
                            fontFamily: 'var(--font-family-heading)'
                          }}
                        >
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
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        fontFamily: 'var(--font-family-primary)'
                      }}
                    >
                      {stat.description}
                    </Typography>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats and Info Section */}
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={8}>
            <AnimatedCard delay={0.4}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-light)',
                  height: '100%'
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'var(--font-family-heading)',
                    mb: 3
                  }}
                >
                  Thống Kê Nhanh
                </Typography>
                <Grid container spacing={2}>
                  {quickStats.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 'action.hover',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'action.selected',
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            color: `${stat.color}.main`,
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: `${stat.color}.main`,
                            fontFamily: 'var(--font-family-heading)',
                            mb: 0.5
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontFamily: 'var(--font-family-primary)',
                            fontSize: '0.7rem'
                          }}
                        >
                          {stat.title}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </AnimatedCard>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <AnimatedCard delay={0.5}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-light)',
                  height: '100%'
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'var(--font-family-heading)',
                    mb: 3
                  }}
                >
                  Thao Tác Nhanh
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/staff/activities')}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      borderRadius: 'var(--radius-lg)',
                      fontWeight: 600,
                      py: 1.5,
                      background: 'var(--color-secondary)',
                      '&:hover': {
                        background: 'var(--color-secondary-dark)'
                      }
                    }}
                  >
                    Quản Lý Hoạt Động
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/staff/assignments')}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      borderRadius: 'var(--radius-lg)',
                      fontWeight: 600,
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2
                      }
                    }}
                  >
                    Xem Lịch Phân Công
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/staff/activity-types')}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      borderRadius: 'var(--radius-lg)',
                      fontWeight: 600,
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2
                      }
                    }}
                  >
                    Loại Hoạt Động
                  </Button>
                </Box>
              </Paper>
            </AnimatedCard>
          </Grid>
        </Grid>

        {/* Info Card */}
        <AnimatedCard delay={0.6}>
          <Paper
            sx={{
              mt: 3,
              p: 3,
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)'
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 600,
                fontFamily: 'var(--font-family-heading)',
                mb: 2
              }}
            >
              Thông Tin Hệ Thống
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontFamily: 'var(--font-family-primary)',
                lineHeight: 1.8
              }}
            >
              Đây là trang dashboard dành cho Staff. Tại đây bạn có thể:
            </Typography>
            <Box component="ul" sx={{ mt: 2, pl: 3, mb: 0 }}>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontFamily: 'var(--font-family-primary)',
                  mb: 1
                }}
              >
                Quản lý và tạo các hoạt động cho học sinh
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontFamily: 'var(--font-family-primary)',
                  mb: 1
                }}
              >
                Xem lịch phân công và điểm danh học sinh
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontFamily: 'var(--font-family-primary)',
                  mb: 1
                }}
              >
                Quản lý các loại hoạt động
              </Typography>
              <Typography 
                component="li" 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontFamily: 'var(--font-family-primary)'
                }}
              >
                Theo dõi thống kê công việc hàng ngày
              </Typography>
            </Box>
          </Paper>
        </AnimatedCard>
      </Box>
    </PageWrapper>
  );
};

export default StaffDashboard;
