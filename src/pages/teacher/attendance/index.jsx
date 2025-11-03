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
  ListItemAvatar,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Today as TodayIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import styles from './AttendanceManagement.module.css';

const AttendanceManagement = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [autoCheckIn, setAutoCheckIn] = useState(false);

  // Mock data for classes
  const classes = [
    {
      id: 1,
      name: 'Toán lớp 3A',
      subject: 'Toán học',
      room: 'Phòng 101',
      time: '08:00 - 09:00',
      students: [
        { id: 1, name: 'Nguyễn Văn B', avatar: 'NB', nfcId: 'NFC001' },
        { id: 2, name: 'Trần Thị C', avatar: 'TC', nfcId: 'NFC002' },
        { id: 3, name: 'Lê Văn D', avatar: 'LD', nfcId: 'NFC003' },
        { id: 4, name: 'Phạm Thị E', avatar: 'PE', nfcId: 'NFC004' },
        { id: 5, name: 'Hoàng Văn F', avatar: 'HF', nfcId: 'NFC005' }
      ]
    },
    {
      id: 2,
      name: 'Tiếng Anh lớp 3B',
      subject: 'Tiếng Anh',
      room: 'Phòng 102',
      time: '09:30 - 10:30',
      students: [
        { id: 6, name: 'Vũ Thị G', avatar: 'VG', nfcId: 'NFC006' },
        { id: 7, name: 'Đặng Văn H', avatar: 'DH', nfcId: 'NFC007' },
        { id: 8, name: 'Bùi Thị I', avatar: 'BI', nfcId: 'NFC008' }
      ]
    }
  ];

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    // Initialize attendance data
    const initialAttendance = {};
    classItem.students.forEach(student => {
      initialAttendance[student.id] = 'present'; // Default to present
    });
    setAttendanceData(initialAttendance);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
    setAttendanceData({});
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    // Here you would save to backend
    console.log('Saving attendance:', attendanceData);
    alert('Điểm danh đã được lưu thành công!');
    handleCloseDialog();
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getAttendanceText = (status) => {
    switch (status) {
      case 'present': return 'Có mặt';
      case 'absent': return 'Vắng mặt';
      case 'late': return 'Đi muộn';
      default: return 'Chưa điểm danh';
    }
  };

  const getAttendanceStats = () => {
    if (!selectedClass) return { present: 0, absent: 0, late: 0 };
    
    const stats = { present: 0, absent: 0, late: 0 };
    selectedClass.students.forEach(student => {
      const status = attendanceData[student.id] || 'present';
      stats[status]++;
    });
    return stats;
  };

  const stats = getAttendanceStats();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý điểm danh</h1>
        <p className={styles.subtitle}>
          Điểm danh học sinh và quản lý NFC check-in
        </p>
      </div>

      {/* Auto Check-in Settings */}
      <Card className={styles.settingsCard}>
        <CardContent>
          <div className={styles.settingsHeader}>
            <Typography variant="h6">
              <AssignmentIcon className={styles.settingsIcon} />
              Cài đặt điểm danh tự động
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={autoCheckIn}
                  onChange={(e) => setAutoCheckIn(e.target.checked)}
                  color="primary"
                />
              }
              label="Bật điểm danh tự động qua NFC"
            />
          </div>
          <Typography variant="body2" color="text.secondary">
            Khi bật, hệ thống sẽ tự động điểm danh học sinh khi họ quét thẻ NFC tại cổng vào lớp học.
          </Typography>
        </CardContent>
      </Card>

      {/* Classes List */}
      <div className={styles.classesGrid}>
        {classes.map((classItem) => (
          <Card key={classItem.id} className={styles.classCard}>
            <CardContent>
              <div className={styles.classHeader}>
                <div className={styles.classInfo}>
                  <Typography variant="h6" component="h3" className={styles.className}>
                    {classItem.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className={styles.subject}>
                    {classItem.subject}
                  </Typography>
                </div>
                <Chip 
                  label={`${classItem.students.length} học sinh`}
                  color="primary"
                  size="small"
                />
              </div>

              <div className={styles.classDetails}>
                <div className={styles.detailItem}>
                  <LocationIcon fontSize="small" className={styles.detailIcon} />
                  <span>{classItem.room}</span>
                </div>
                <div className={styles.detailItem}>
                  <ScheduleIcon fontSize="small" className={styles.detailIcon} />
                  <span>{classItem.time}</span>
                </div>
              </div>

              <div className={styles.classActions}>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => handleClassSelect(classItem)}
                  startIcon={<AssignmentIcon />}
                >
                  Điểm danh
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className={styles.dialogHeader}>
            <Typography variant="h6">
              <TodayIcon className={styles.dialogIcon} />
              Điểm danh - {selectedClass?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedClass?.subject} • {selectedClass?.room} • {selectedClass?.time}
            </Typography>
          </div>
        </DialogTitle>
        
        <DialogContent>
          {selectedClass && (
            <div className={styles.attendanceContent}>
              {/* Attendance Stats */}
              <div className={styles.attendanceStats}>
                <Chip 
                  label={`Có mặt: ${stats.present}`}
                  color="success"
                  icon={<CheckIcon />}
                />
                <Chip 
                  label={`Vắng mặt: ${stats.absent}`}
                  color="error"
                  icon={<CancelIcon />}
                />
                <Chip 
                  label={`Đi muộn: ${stats.late}`}
                  color="warning"
                />
              </div>

              {/* Students List */}
              <div className={styles.studentsList}>
                <Typography variant="h6" className={styles.listTitle}>
                  Danh sách học sinh
                </Typography>
                
                <List>
                  {selectedClass.students.map((student, index) => (
                    <React.Fragment key={student.id}>
                      <ListItem className={styles.studentItem}>
                        <ListItemAvatar>
                          <Avatar className={styles.studentAvatar}>
                            {student.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={student.name}
                          secondary={`NFC ID: ${student.nfcId}`}
                        />
                        <div className={styles.attendanceControls}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                              value={attendanceData[student.id] || 'present'}
                              onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                              label="Trạng thái"
                            >
                              <MenuItem value="present">Có mặt</MenuItem>
                              <MenuItem value="absent">Vắng mặt</MenuItem>
                              <MenuItem value="late">Đi muộn</MenuItem>
                            </Select>
                          </FormControl>
                        </div>
                      </ListItem>
                      {index < selectedClass.students.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </div>
            </div>
          )}
        </DialogContent>
        
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Hủy
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveAttendance}
            startIcon={<SaveIcon />}
          >
            Lưu điểm danh
          </Button>
        </Box>
      </Dialog>
    </div>
  );
};

export default AttendanceManagement;
