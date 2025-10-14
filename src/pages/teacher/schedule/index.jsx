import React, { useState, useRef } from 'react';
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
  Link,
  Tabs,
  Tab
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './Schedule.module.css';

const TeacherSchedule = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const calendarRef = useRef(null);

  // Mock data for schedule - FullCalendar format
  const calendarEvents = [
    {
      id: '1',
      title: 'Toán lớp 3A',
      start: '2024-01-15T08:00:00',
      end: '2024-01-15T09:00:00',
      backgroundColor: '#1976d2',
      borderColor: '#1976d2',
      extendedProps: {
        subject: 'Toán học',
        room: 'Phòng 101',
        students: 25,
        status: 'scheduled',
        description: 'Bài học về phép cộng và trừ'
      }
    },
    {
      id: '2',
      title: 'Tiếng Anh lớp 3B',
      start: '2024-01-15T09:30:00',
      end: '2024-01-15T10:30:00',
      backgroundColor: '#2e7d32',
      borderColor: '#2e7d32',
      extendedProps: {
        subject: 'Tiếng Anh',
        room: 'Phòng 102',
        students: 23,
        status: 'completed',
        description: 'Học từ vựng về gia đình'
      }
    },
    {
      id: '3',
      title: 'Khoa học lớp 4A',
      start: '2024-01-17T14:00:00',
      end: '2024-01-17T15:00:00',
      backgroundColor: '#ed6c02',
      borderColor: '#ed6c02',
      extendedProps: {
        subject: 'Khoa học',
        room: 'Phòng 201',
        students: 28,
        status: 'scheduled',
        description: 'Thí nghiệm về nước'
      }
    },
    {
      id: '4',
      title: 'Toán lớp 3A',
      start: '2024-01-18T08:00:00',
      end: '2024-01-18T09:00:00',
      backgroundColor: '#1976d2',
      borderColor: '#1976d2',
      extendedProps: {
        subject: 'Toán học',
        room: 'Phòng 101',
        students: 25,
        status: 'scheduled',
        description: 'Bài học về phép nhân'
      }
    },
    {
      id: '5',
      title: 'Tiếng Anh lớp 3B',
      start: '2024-01-19T09:30:00',
      end: '2024-01-19T10:30:00',
      backgroundColor: '#2e7d32',
      borderColor: '#2e7d32',
      extendedProps: {
        subject: 'Tiếng Anh',
        room: 'Phòng 102',
        students: 23,
        status: 'scheduled',
        description: 'Ngữ pháp cơ bản'
      }
    },
    {
      id: '6',
      title: 'Toán lớp 3A',
      start: '2024-01-22T08:00:00',
      end: '2024-01-22T09:00:00',
      backgroundColor: '#1976d2',
      borderColor: '#1976d2',
      extendedProps: {
        subject: 'Toán học',
        room: 'Phòng 101',
        students: 25,
        status: 'scheduled',
        description: 'Bài học về phép chia'
      }
    },
    {
      id: '7',
      title: 'Tiếng Anh lớp 3B',
      start: '2024-01-22T09:30:00',
      end: '2024-01-22T10:30:00',
      backgroundColor: '#2e7d32',
      borderColor: '#2e7d32',
      extendedProps: {
        subject: 'Tiếng Anh',
        room: 'Phòng 102',
        students: 23,
        status: 'scheduled',
        description: 'Luyện nghe'
      }
    }
  ];


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
  };

  // FullCalendar event handlers
  const handleEventClick = (info) => {
    const event = info.event;
    const classData = {
      id: event.id,
      className: event.title,
      subject: event.extendedProps.subject,
      room: event.extendedProps.room,
      time: `${event.start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      students: event.extendedProps.students,
      status: event.extendedProps.status,
      description: event.extendedProps.description,
      date: event.start.toLocaleDateString('vi-VN')
    };
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleDateClick = (info) => {
    // Handle date click for adding new events
    console.log('Date clicked:', info.dateStr);
  };

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

      {/* Calendar Content */}
      <div className={styles.scheduleContainer}>
        <div className={styles.calendarContainer}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            locale="vi"
            height="auto"
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            nowIndicator={true}
            eventDisplay="block"
            eventTextColor="white"
            eventBorderColor="transparent"
            dayHeaderFormat={{ weekday: 'short' }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
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