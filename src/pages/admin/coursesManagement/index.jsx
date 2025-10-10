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
import styles from './CoursesManagement.module.css';

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
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Quản lý Khóa học
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className={styles.addButton}
        >
          Thêm Khóa học
        </Button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>
              Tổng khóa học
            </span>
            <div className={`${styles.statIcon} ${styles.primary}`}>
              <SchoolIcon />
            </div>
          </div>
          <p className={styles.statValue}>
            {courses.length}
          </p>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>
              Đang hoạt động
            </span>
            <div className={`${styles.statIcon} ${styles.success}`}>
              <ScheduleIcon />
            </div>
          </div>
          <p className={styles.statValue}>
            {courses.filter(c => c.status === 'active').length}
          </p>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>
              Tổng học sinh
            </span>
            <div className={`${styles.statIcon} ${styles.info}`}>
              <PeopleIcon />
            </div>
          </div>
          <p className={styles.statValue}>
            {courses.reduce((sum, c) => sum + c.students, 0)}
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div className={styles.coursesGrid}>
        {courses.map((course) => (
          <div key={course.id} className={styles.courseCard}>
            <div className={styles.courseHeader}>
              <h3 className={styles.courseName}>
                {course.name}
              </h3>
              <span className={`${styles.statusChip} ${styles[course.status]}`}>
                {getStatusText(course.status)}
              </span>
            </div>
            
            <p className={styles.descriptionText}>
              {course.description}
            </p>
            
            <div className={styles.courseInfo}>
              <span className={styles.infoItem}>
                <PeopleIcon fontSize="small" />
                {course.students} học sinh
              </span>
              <span className={styles.infoItem}>
                <ScheduleIcon fontSize="small" />
                {course.duration}
              </span>
            </div>
            
            <div className={styles.courseActions}>
              <Button size="small" variant="outlined">
                Chỉnh sửa
              </Button>
              <Button size="small" variant="outlined" color="error">
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseManagement;
