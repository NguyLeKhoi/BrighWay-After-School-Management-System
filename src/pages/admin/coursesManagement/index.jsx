import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const CourseManagement = () => {
  const courses = [
    {
      id: 1,
      name: 'Toán học cơ bản',
      description: 'Khóa học toán học dành cho học sinh tiểu học',
      students: 25,
      duration: '3 tháng',
      status: 'active'
    },
    {
      id: 2,
      name: 'Tiếng Anh giao tiếp',
      description: 'Khóa học tiếng Anh giao tiếp cơ bản',
      students: 18,
      duration: '6 tháng',
      status: 'active'
    },
    {
      id: 3,
      name: 'Khoa học tự nhiên',
      description: 'Khóa học khoa học thực hành',
      students: 12,
      duration: '4 tháng',
      status: 'inactive'
    }
  ];

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  const getStatusText = (status) => {
    return status === 'active' ? 'Hoạt động' : 'Tạm dừng';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Quản lý Khóa học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Thêm Khóa học
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng khóa học
                  </Typography>
                  <Typography variant="h4">
                    {courses.length}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h4">
                    {courses.filter(c => c.status === 'active').length}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Tổng học sinh
                  </Typography>
                  <Typography variant="h4">
                    {courses.reduce((sum, c) => sum + c.students, 0)}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Courses List */}
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.id}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  {course.name}
                </Typography>
                <Chip 
                  label={getStatusText(course.status)}
                  color={getStatusColor(course.status)}
                  size="small"
                />
              </Box>
              
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                {course.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  <PeopleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {course.students} học sinh
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {course.duration}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined">
                  Chỉnh sửa
                </Button>
                <Button size="small" variant="outlined" color="error">
                  Xóa
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CourseManagement;
