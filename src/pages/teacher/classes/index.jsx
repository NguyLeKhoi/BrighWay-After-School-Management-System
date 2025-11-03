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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Class as ClassIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Upload as UploadIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import styles from './ClassManagement.module.css';

const ClassManagement = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Mock data for classes
  const classes = [
    {
      id: 1,
      name: 'Toán lớp 3A',
      subject: 'Toán học',
      grade: 'Lớp 3',
      room: 'Phòng 101',
      schedule: 'Thứ 2, 4, 6 - 08:00-09:00',
      students: 25,
      teacher: 'Nguyễn Văn A',
      status: 'active',
      studentsList: [
        { id: 1, name: 'Nguyễn Văn B', avatar: 'NB', attendance: 'present' },
        { id: 2, name: 'Trần Thị C', avatar: 'TC', attendance: 'present' },
        { id: 3, name: 'Lê Văn D', avatar: 'LD', attendance: 'absent' },
        { id: 4, name: 'Phạm Thị E', avatar: 'PE', attendance: 'present' },
        { id: 5, name: 'Hoàng Văn F', avatar: 'HF', attendance: 'late' }
      ]
    },
    {
      id: 2,
      name: 'Tiếng Anh lớp 3B',
      subject: 'Tiếng Anh',
      grade: 'Lớp 3',
      room: 'Phòng 102',
      schedule: 'Thứ 3, 5 - 09:30-10:30',
      students: 23,
      teacher: 'Nguyễn Văn A',
      status: 'active',
      studentsList: [
        { id: 6, name: 'Vũ Thị G', avatar: 'VG', attendance: 'present' },
        { id: 7, name: 'Đặng Văn H', avatar: 'DH', attendance: 'present' },
        { id: 8, name: 'Bùi Thị I', avatar: 'BI', attendance: 'present' }
      ]
    },
    {
      id: 3,
      name: 'Khoa học lớp 4A',
      subject: 'Khoa học',
      grade: 'Lớp 4',
      room: 'Phòng 201',
      schedule: 'Thứ 2, 4 - 14:00-15:00',
      students: 28,
      teacher: 'Nguyễn Văn A',
      status: 'active',
      studentsList: [
        { id: 9, name: 'Ngô Văn J', avatar: 'NJ', attendance: 'present' },
        { id: 10, name: 'Dương Thị K', avatar: 'DK', attendance: 'absent' }
      ]
    }
  ];

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
  };

  const getAttendanceColor = (attendance) => {
    switch (attendance) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getAttendanceText = (attendance) => {
    switch (attendance) {
      case 'present': return 'Có mặt';
      case 'absent': return 'Vắng mặt';
      case 'late': return 'Đi muộn';
      default: return 'Chưa điểm danh';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý lớp học</h1>
        <p className={styles.subtitle}>
          Quản lý danh sách lớp và học sinh
        </p>
      </div>

      {/* Classes Grid */}
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
                    {classItem.subject} • {classItem.grade}
                  </Typography>
                </div>
                <IconButton size="small">
                  <MoreIcon />
                </IconButton>
              </div>

              <div className={styles.classDetails}>
                <div className={styles.detailItem}>
                  <LocationIcon fontSize="small" className={styles.detailIcon} />
                  <span>{classItem.room}</span>
                </div>
                <div className={styles.detailItem}>
                  <ScheduleIcon fontSize="small" className={styles.detailIcon} />
                  <span>{classItem.schedule}</span>
                </div>
                <div className={styles.detailItem}>
                  <PeopleIcon fontSize="small" className={styles.detailIcon} />
                  <span>{classItem.students} học sinh</span>
                </div>
              </div>

              <div className={styles.classActions}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleClassSelect(classItem)}
                  startIcon={<PeopleIcon />}
                >
                  Xem danh sách
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => window.location.href = `/teacher/attendance/${classItem.id}`}
                  startIcon={<AssignmentIcon />}
                >
                  Điểm danh
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className={styles.dialogHeader}>
            <Typography variant="h6">
              {selectedClass?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedClass?.subject} • {selectedClass?.grade}
            </Typography>
          </div>
        </DialogTitle>
        
        <DialogContent>
          {selectedClass && (
            <div className={styles.studentsList}>
              <div className={styles.listHeader}>
                <Typography variant="h6">
                  Danh sách học sinh ({selectedClass.studentsList.length})
                </Typography>
                <div className={styles.attendanceStats}>
                  <Chip 
                    label={`Có mặt: ${selectedClass.studentsList.filter(s => s.attendance === 'present').length}`}
                    color="success"
                    size="small"
                  />
                  <Chip 
                    label={`Vắng mặt: ${selectedClass.studentsList.filter(s => s.attendance === 'absent').length}`}
                    color="error"
                    size="small"
                  />
                  <Chip 
                    label={`Đi muộn: ${selectedClass.studentsList.filter(s => s.attendance === 'late').length}`}
                    color="warning"
                    size="small"
                  />
                </div>
              </div>

              <List>
                {selectedClass.studentsList.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <ListItem className={styles.studentItem}>
                      <ListItemAvatar>
                        <Avatar className={styles.studentAvatar}>
                          {student.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={student.name}
                        secondary={
                          <div className={styles.studentActions}>
                            <Chip 
                              label={getAttendanceText(student.attendance)}
                              color={getAttendanceColor(student.attendance)}
                              size="small"
                            />
                            <Button 
                              size="small"
                              onClick={() => window.location.href = `/teacher/performance/${student.id}`}
                            >
                              Đánh giá
                            </Button>
                          </div>
                        }
                      />
                    </ListItem>
                    {index < selectedClass.studentsList.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </div>
          )}
        </DialogContent>
        
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Đóng
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              handleCloseDialog();
              window.location.href = `/teacher/attendance/${selectedClass?.id}`;
            }}
          >
            Điểm danh
          </Button>
        </Box>
      </Dialog>
    </div>
  );
};

export default ClassManagement;
