import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Class as ClassIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import styles from './Schedule.module.css';

const TeacherSchedule = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Mock data for schedule
  const scheduleData = [
    {
      id: 1,
      className: 'Toán lớp 3A',
      subject: 'Toán học',
      room: 'Phòng 101',
      time: '08:00 - 09:00',
      slot: 1,
      day: 1, // Monday
      date: '2024-01-15',
      students: 25,
      status: 'scheduled',
      description: 'Bài học về phép cộng và trừ',
      color: '#1976d2'
    },
    {
      id: 2,
      className: 'Tiếng Anh lớp 3B',
      subject: 'Tiếng Anh',
      room: 'Phòng 102',
      time: '09:30 - 10:30',
      slot: 2,
      day: 1, // Monday
      date: '2024-01-15',
      students: 23,
      status: 'completed',
      description: 'Học từ vựng về gia đình',
      color: '#2e7d32'
    },
    {
      id: 3,
      className: 'Khoa học lớp 4A',
      subject: 'Khoa học',
      room: 'Phòng 201',
      time: '14:00 - 15:00',
      slot: 4,
      day: 3, // Wednesday
      date: '2024-01-17',
      students: 28,
      status: 'scheduled',
      description: 'Thí nghiệm về nước',
      color: '#ed6c02'
    },
    {
      id: 4,
      className: 'Toán lớp 3A',
      subject: 'Toán học',
      room: 'Phòng 101',
      time: '08:00 - 09:00',
      slot: 1,
      day: 4, // Thursday
      date: '2024-01-18',
      students: 25,
      status: 'scheduled',
      description: 'Bài học về phép nhân',
      color: '#1976d2'
    },
    {
      id: 5,
      className: 'Tiếng Anh lớp 3B',
      subject: 'Tiếng Anh',
      room: 'Phòng 102',
      time: '09:30 - 10:30',
      slot: 2,
      day: 5, // Friday
      date: '2024-01-19',
      students: 23,
      status: 'scheduled',
      description: 'Ngữ pháp cơ bản',
      color: '#2e7d32'
    }
  ];

  const timeSlots = [
    { time: '07:00-08:00' },
    { time: '08:00-09:00' },
    { time: '09:00-10:00' },
    { time: '10:00-11:00' },
    { time: '11:00-12:00' },
    { time: '12:00-13:00' },
    { time: '13:00-14:00' },
    { time: '14:00-15:00' },
    { time: '15:00-16:00' },
    { time: '16:00-17:00' },
    { time: '17:00-18:00' },
    { time: '18:00-19:00' },
    { time: '19:00-20:00' }
  ];

  const daysOfWeek = [
    { day: 1, name: 'MON', label: 'Thứ Hai' },
    { day: 2, name: 'TUE', label: 'Thứ Ba' },
    { day: 3, name: 'WED', label: 'Thứ Tư' },
    { day: 4, name: 'THU', label: 'Thứ Năm' },
    { day: 5, name: 'FRI', label: 'Thứ Sáu' },
    { day: 6, name: 'SAT', label: 'Thứ Bảy' },
    { day: 0, name: 'SUN', label: 'Chủ Nhật' }
  ];

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7)); // Start from Monday
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const getClassForTime = (time, day) => {
    return scheduleData.find(item => item.time === time && item.day === day);
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#1976d2';
      case 'completed': return '#2e7d32';
      case 'cancelled': return '#d32f2f';
      default: return '#666';
    }
  };

  const weekDates = getWeekDates();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/teacher">
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Trang chủ
            </Link>
            <Link underline="hover" color="inherit" href="/teacher/schedule">
              Lịch học
            </Link>
            <Typography color="text.primary">Thời khóa biểu từng tuần</Typography>
          </Breadcrumbs>
        </div>
        
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            Thời khóa biểu từng tuần
          </h1>
          
          <div className={styles.controls}>
            <div className={styles.yearControl}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Năm</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Năm"
                >
                  <MenuItem value={2023}>2023</MenuItem>
                  <MenuItem value={2024}>2024</MenuItem>
                  <MenuItem value={2025}>2025</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.weekControl}>
              <IconButton 
                onClick={() => setCurrentWeek(currentWeek - 1)}
                size="small"
              >
                <NavigateBeforeIcon />
              </IconButton>
              <TextField
                value={`${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1} - ${weekDates[6].getDate()}/${weekDates[6].getMonth() + 1}`}
                size="small"
                sx={{ minWidth: 150 }}
                InputProps={{ readOnly: true }}
              />
              <IconButton 
                onClick={() => setCurrentWeek(currentWeek + 1)}
                size="small"
              >
                <NavigateNextIcon />
              </IconButton>
            </div>
            
            <Button 
              variant="contained" 
              startIcon={<CalendarIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Nhập vào lịch
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className={styles.scheduleContainer}>
        <div className={styles.scheduleGrid}>
          {/* Header Row */}
          <div className={styles.gridHeader}>
            <div className={styles.timeHeader}>GIỜ</div>
            {daysOfWeek.map((day, index) => (
              <div key={day.day} className={styles.dayHeader}>
                <div className={styles.dayName}>{day.name}</div>
                <div className={styles.dayDate}>
                  {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {timeSlots.map((timeSlot, index) => (
            <div key={index} className={styles.timeSlotRow}>
              <div className={styles.timeLabel}>
                {timeSlot.time}
              </div>
              
              {daysOfWeek.map((day) => {
                const classItem = getClassForTime(timeSlot.time, day.day);
                return (
                  <div 
                    key={`${timeSlot.time}-${day.day}`} 
                    className={styles.scheduleCell}
                    onClick={() => classItem && handleClassSelect(classItem)}
                  >
                    {classItem && (
                      <div 
                        className={styles.classBlock}
                        style={{ backgroundColor: classItem.color }}
                      >
                        <div className={styles.className}>{classItem.className}</div>
                        <div className={styles.classRoom}>
                          <LocationIcon className={styles.classIcon} />
                          {classItem.room}
                        </div>
                        <div className={styles.classStatus}>
                          {classItem.status === 'completed' ? '✓' : '○'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ backgroundColor: '#1976d2' }}></div>
          <span>Chưa học</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ backgroundColor: '#2e7d32' }}></div>
          <span>Đã học</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ backgroundColor: '#d32f2f' }}></div>
          <span>Vắng mặt</span>
        </div>
      </div>

      {/* Class Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div className={styles.dialogHeader}>
            <Typography variant="h6">
              {selectedClass ? 'Chi tiết lớp học' : 'Thêm lịch học mới'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedClass?.className || 'Thông tin lớp học'}
            </Typography>
          </div>
        </DialogTitle>
        
        <DialogContent>
          <div className={styles.dialogContent}>
            {selectedClass && (
              <div className={styles.classDetails}>
                <div className={styles.detailRow}>
                  <Typography variant="body2" className={styles.detailLabel}>
                    Môn học:
                  </Typography>
                  <Typography variant="body1">
                    {selectedClass.subject}
                  </Typography>
                </div>
                <div className={styles.detailRow}>
                  <Typography variant="body2" className={styles.detailLabel}>
                    Thời gian:
                  </Typography>
                  <Typography variant="body1">
                    {selectedClass.time}
                  </Typography>
                </div>
                <div className={styles.detailRow}>
                  <Typography variant="body2" className={styles.detailLabel}>
                    Phòng học:
                  </Typography>
                  <Typography variant="body1">
                    {selectedClass.room}
                  </Typography>
                </div>
                <div className={styles.detailRow}>
                  <Typography variant="body2" className={styles.detailLabel}>
                    Số học sinh:
                  </Typography>
                  <Typography variant="body1">
                    {selectedClass.students}
                  </Typography>
                </div>
                <div className={styles.detailRow}>
                  <Typography variant="body2" className={styles.detailLabel}>
                    Mô tả:
                  </Typography>
                  <Typography variant="body1">
                    {selectedClass.description}
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Đóng
          </Button>
          {selectedClass && (
            <Button 
              variant="contained"
              onClick={() => {
                handleCloseDialog();
                window.location.href = `/teacher/classes/${selectedClass.id}`;
              }}
            >
              Quản lý lớp này
            </Button>
          )}
          {!selectedClass && (
            <Button 
              variant="contained"
              onClick={() => {
                handleCloseDialog();
                window.location.href = `/teacher/classes`;
              }}
            >
              Quản lý lớp
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeacherSchedule;