import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Box, 
  Typography, 
  Alert, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  ArrowBack, 
  ViewList, 
  CalendarMonth, 
  CalendarToday, 
  AccessTime, 
  MeetingRoom, 
  Business, 
  Person,
  CheckCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentSlotService from '../../../services/studentSlot.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import ContentLoading from '../../../components/Common/ContentLoading';
import DataTable from '../../../components/Common/DataTable';
import { useApp } from '../../../contexts/AppContext';
import { extractDateString, formatDateOnlyUTC7 } from '../../../utils/dateHelper';
import styles from './assignments.module.css';

const StaffAssignments = () => {
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState([]);
  const [rawSlots, setRawSlots] = useState({
    past: [],
    current: [],
    upcoming: [],
    all: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'schedule'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Pagination states for each section
  const [pagination, setPagination] = useState({
    current: { page: 0, rowsPerPage: 10 },
    upcoming: { page: 0, rowsPerPage: 10 },
    past: { page: 0, rowsPerPage: 10 }
  });
  
  const { isLoading, showLoading, hideLoading } = useLoading();
  const { showGlobalError } = useApp();

  // Màu sắc cho các trạng thái
  const getStatusColor = (status) => {
    return 'var(--color-primary)';
  };

  // Xác định loại lịch: past, current, upcoming
  const getSlotTimeType = (slot) => {
    const dateValue = slot.branchSlot?.date || slot.date;
    const timeframe = slot.timeframe || slot.timeFrame;
    
    if (!dateValue || !timeframe) return 'upcoming';
    
    try {
      const dateStr = extractDateString(dateValue);
      const startTime = timeframe.startTime || '00:00:00';
      const endTime = timeframe.endTime || '00:00:00';
      
      const formatTime = (time) => {
        if (!time) return '00:00:00';
        if (time.length === 5) return time + ':00';
        return time;
      };
      
      const formattedStartTime = formatTime(startTime);
      const formattedEndTime = formatTime(endTime);
      
      const startDateTime = new Date(`${dateStr}T${formattedStartTime}+07:00`);
      const endDateTime = new Date(`${dateStr}T${formattedEndTime}+07:00`);
      const now = new Date();
      
      if (endDateTime < now) {
        return 'past';
      } else if (startDateTime <= now && now <= endDateTime) {
        return 'current';
      } else {
        return 'upcoming';
      }
    } catch (error) {
      return 'upcoming';
    }
  };

  // Màu sắc cho từng loại lịch
  const getTimeTypeColor = (timeType) => {
    switch (timeType) {
      case 'past':
        return '#9e9e9e'; // Gray - đã qua
      case 'current':
        return '#ff9800'; // Orange - đang diễn ra
      case 'upcoming':
        return 'var(--color-primary)'; // Teal - sắp tới
      default:
        return 'var(--color-primary)';
    }
  };

  // Chuyển đổi student slot từ API sang format FullCalendar (cho từng slot riêng lẻ)
  const transformSlotToEvent = (slot) => {
    const dateValue = slot.branchSlot?.date || slot.date;
    if (!dateValue) {
      return null;
    }

    const timeframe = slot.timeframe || slot.timeFrame;
    if (!timeframe) {
      return null;
    }

    const dateStr = extractDateString(dateValue);
    if (!dateStr) {
        return null;
    }
    
    const startTime = timeframe.startTime || '00:00:00';
    const endTime = timeframe.endTime || '00:00:00';
    
    const formatTime = (time) => {
      if (!time) return '00:00:00';
      if (time.length === 5) return time + ':00';
      return time;
    };
    
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    
    const startDateTime = `${dateStr}T${formattedStartTime}`;
    const endDateTime = `${dateStr}T${formattedEndTime}`;

    const status = slot.status || 'Booked';
    const backgroundColor = getStatusColor(status);

    const roomName = slot.room?.roomName || slot.roomName || slot.branchSlot?.roomName || 'Chưa xác định';
    const branchName = slot.branchSlot?.branchName || slot.branchName || 'Chưa xác định';
    const timeframeName = timeframe.name || 'Chưa xác định';

    const formatTimeDisplay = (time) => {
      if (!time) return '00:00';
      return time.substring(0, 5);
    };

    const timeDisplay = `${formatTimeDisplay(startTime)}-${formatTimeDisplay(endTime)}`;
    const studentName = slot.student?.name || slot.studentName || 'Chưa xác định';

    const timeType = getSlotTimeType(slot);
    const timeTypeColor = getTimeTypeColor(timeType);

    return {
      id: slot.id,
      title: `${timeframeName} - ${studentName}`,
      start: startDateTime,
      end: endDateTime,
      backgroundColor: timeTypeColor,
      borderColor: timeTypeColor,
      textColor: 'white',
      display: 'block',
      classNames: ['custom-event', `event-${timeType}`],
      extendedProps: {
        status: status,
        roomName: roomName,
        branchName: branchName,
        studentName: studentName,
        timeframe: timeframe,
        timeframeName: timeframeName,
        timeDisplay: timeDisplay,
        slotId: slot.id,
        timeType: timeType
      }
    };
  };

  // Hàm helper để load tất cả các trang
  const fetchAllStaffSlots = async () => {
    const allSlots = [];
    let pageIndex = 1;
    const pageSize = 100;
    let hasMore = true;
    let totalCount = 0;
    let totalPages = 0;

    while (hasMore) {
      const response = await studentSlotService.getStaffSlots({
        pageIndex: pageIndex,
        pageSize: pageSize,
        upcomingOnly: false
      });

      const items = response?.items || [];
      
      if (pageIndex === 1) {
        totalCount = response?.totalCount || 0;
        totalPages = response?.totalPages;
        
        if (!totalPages && totalCount > 0) {
          totalPages = Math.ceil(totalCount / pageSize);
        }
      }

      if (items.length > 0) {
        allSlots.push(...items);
      }

      if (totalPages > 0) {
        if (pageIndex >= totalPages) {
          hasMore = false;
        } else {
          pageIndex++;
        }
      } else {
        if (items.length < pageSize) {
          hasMore = false;
        } else {
          pageIndex++;
        }
      }
    }

    return allSlots;
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoading();

      // Lấy tất cả slots
      const slots = await fetchAllStaffSlots();
      
      // Phân loại slots theo thời gian
      const now = new Date();
      const pastSlots = [];
      const currentSlots = [];
      const upcomingSlots = [];

      slots.forEach(slot => {
        const timeType = getSlotTimeType(slot);
        if (timeType === 'past') {
          pastSlots.push(slot);
        } else if (timeType === 'current') {
          currentSlots.push(slot);
        } else {
          upcomingSlots.push(slot);
        }
      });

      // Sắp xếp: past (mới nhất trước), upcoming (sớm nhất trước)
      pastSlots.sort((a, b) => {
        const dateA = new Date(a.branchSlot?.date || a.date || 0);
        const dateB = new Date(b.branchSlot?.date || b.date || 0);
        return dateB - dateA;
      });

      upcomingSlots.sort((a, b) => {
        const dateA = new Date(a.branchSlot?.date || a.date || 0);
        const dateB = new Date(b.branchSlot?.date || b.date || 0);
        return dateA - dateB;
      });

      setRawSlots({
        past: pastSlots,
        current: currentSlots,
        upcoming: upcomingSlots,
        all: slots
      });

      // Transform slots to events for calendar
      const events = slots
        .map(transformSlotToEvent)
        .filter(Boolean);

      setScheduleData(events);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải lịch giữ trẻ';
      setError(errorMessage);
      showGlobalError(errorMessage);
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Event handlers cho FullCalendar
  const handleEventClick = async (clickInfo) => {
    const event = clickInfo.event;
    const slotId = event.extendedProps.slotId;
    
    // Tìm slot từ rawSlots
    const slot = rawSlots.all.find(s => s.id === slotId);
    if (!slot) return;

    setSelectedSlot({
      slotId: slot.id,
      date: slot.branchSlot?.date || slot.date,
      roomName: slot.room?.roomName || slot.roomName || slot.branchSlot?.roomName || 'Chưa xác định',
      branchName: slot.branchSlot?.branchName || slot.branchName || 'Chưa xác định',
      timeframe: slot.timeframe || slot.timeFrame,
      timeframeName: (slot.timeframe || slot.timeFrame)?.name || 'Chưa xác định',
      timeDisplay: event.extendedProps.timeDisplay,
      studentName: slot.student?.name || slot.studentName || 'Chưa xác định'
    });

    // Fetch danh sách học sinh cho slot này (tất cả slots cùng branchSlotId và date)
    const dateValue = slot.branchSlot?.date || slot.date;
    const branchSlotId = slot.branchSlotId;
    if (branchSlotId && dateValue) {
      await fetchStudentsForSlot(branchSlotId, dateValue);
    }
  };

  // Handler cho card click
  const handleCardClick = async (slot) => {
    setSelectedSlot({
      slotId: slot.id,
      date: slot.branchSlot?.date || slot.date,
      roomName: slot.room?.roomName || slot.roomName || slot.branchSlot?.roomName || 'Chưa xác định',
      branchName: slot.branchSlot?.branchName || slot.branchName || 'Chưa xác định',
      timeframe: slot.timeframe || slot.timeFrame,
      timeframeName: (slot.timeframe || slot.timeFrame)?.name || 'Chưa xác định',
      timeDisplay: (() => {
        const tf = slot.timeframe || slot.timeFrame;
        if (!tf) return 'Chưa xác định';
        const start = tf.startTime?.substring(0, 5) || '';
        const end = tf.endTime?.substring(0, 5) || '';
        return `${start}-${end}`;
      })(),
      studentName: slot.student?.name || slot.studentName || 'Chưa xác định'
    });

    const dateValue = slot.branchSlot?.date || slot.date;
    const branchSlotId = slot.branchSlotId;
    if (branchSlotId && dateValue) {
      await fetchStudentsForSlot(branchSlotId, dateValue);
    }
  };

  const fetchStudentsForSlot = async (branchSlotId, date) => {
    setLoadingStudents(true);
    setStudentsList([]);
    setStudentsDialogOpen(true);

    try {
      const response = await studentSlotService.getStaffSlots({
        pageIndex: 1,
        pageSize: 1000,
        branchSlotId: branchSlotId,
        date: date,
        upcomingOnly: false
      });

      const slots = response?.items || [];
      const bookedSlots = slots.filter(slot => 
        slot.status === 'Booked' || slot.status === 'booked'
      );

      setStudentsList(bookedSlots);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách học sinh';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCloseStudentsDialog = () => {
    setStudentsDialogOpen(false);
    setSelectedSlot(null);
    setStudentsList([]);
  };

  // Handler cho view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Pagination handlers
  const handlePageChange = (section, newPage) => {
    setPagination(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        page: newPage
      }
    }));
  };

  const handleRowsPerPageChange = (section, newRowsPerPage) => {
    setPagination(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        rowsPerPage: newRowsPerPage,
        page: 0 // Reset to first page when changing rows per page
      }
    }));
  };

  // Ngăn chặn drag & drop và các thao tác chỉnh sửa
  const handleDateSelect = () => {
    return false;
  };

  const handleEventDrop = (dropInfo) => {
    dropInfo.revert();
  };

  const handleEventResize = (resizeInfo) => {
    resizeInfo.revert();
  };

  // Define columns for DataTable
  const tableColumns = useMemo(() => {
    const statusLabels = {
      'Booked': 'Đã đăng ký',
      'Confirmed': 'Đã xác nhận',
      'Cancelled': 'Đã hủy',
      'Completed': 'Đã hoàn thành',
      'Pending': 'Chờ xử lý'
    };

    const formatTimeDisplay = (time) => {
      if (!time) return '00:00';
      return time.substring(0, 5);
    };

    const getTimeTypeLabel = (timeType) => {
      switch (timeType) {
        case 'past':
          return 'Đã qua';
        case 'current':
          return 'Đang diễn ra';
        case 'upcoming':
          return 'Sắp tới';
        default:
          return '';
      }
    };

    return [
      {
        key: 'date',
        header: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday fontSize="small" />
            <span>Ngày</span>
          </Box>
        ),
        render: (value, item) => {
          const dateValue = item.branchSlot?.date || item.date;
          const timeType = getSlotTimeType(item);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {dateValue ? formatDateOnlyUTC7(dateValue) : 'Chưa xác định'}
              <Chip
                label={getTimeTypeLabel(timeType)}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: getTimeTypeColor(timeType),
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
          );
        }
      },
      {
        key: 'time',
        header: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime fontSize="small" />
            <span>Giờ</span>
          </Box>
        ),
        render: (value, item) => {
          const timeframe = item.timeframe || item.timeFrame;
          if (!timeframe) return 'Chưa xác định';
          return `${formatTimeDisplay(timeframe.startTime)}-${formatTimeDisplay(timeframe.endTime)}`;
        }
      },
      {
        key: 'student',
        header: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person fontSize="small" />
            <span>Học sinh</span>
          </Box>
        ),
        render: (value, item) => {
          return item.student?.name || item.studentName || 'Chưa xác định';
        }
      },
      {
        key: 'room',
        header: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MeetingRoom fontSize="small" />
            <span>Phòng</span>
          </Box>
        ),
        render: (value, item) => {
          return item.room?.roomName || item.roomName || item.branchSlot?.roomName || 'Chưa xác định';
        }
      },
      {
        key: 'branch',
        header: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business fontSize="small" />
            <span>Chi nhánh</span>
          </Box>
        ),
        render: (value, item) => {
          return item.branchSlot?.branchName || item.branchName || 'Chưa xác định';
        }
      },
      {
        key: 'status',
        header: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle fontSize="small" />
            <span>Trạng thái</span>
          </Box>
        ),
        render: (value, item) => {
          const status = item.status || 'Booked';
          return (
            <Chip
              label={statusLabels[status] || status}
              size="small"
              sx={{
                backgroundColor: getStatusColor(status),
                color: 'white',
                fontWeight: 600
              }}
            />
          );
        }
      }
    ];
  }, []);

  if (loading) {
    return (
      <div className={styles.schedulePage}>
        <div className={styles.container}>
          <ContentLoading isLoading={true} text="Đang tải lịch giữ trẻ..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.schedulePage}>
      <div className={styles.container}>
        {/* Header */}
        <Paper 
          elevation={0}
          sx={{
            padding: 3,
            marginBottom: 3,
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/staff/dashboard')}
                variant="contained"
                sx={{
                  borderRadius: 'var(--radius-lg)',
                  textTransform: 'none',
                  fontFamily: 'var(--font-family)',
                  background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                  boxShadow: 'var(--shadow-sm)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 100%)',
                    boxShadow: 'var(--shadow-md)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Quay lại
              </Button>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{
                    fontFamily: 'var(--font-family-heading)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)',
                    marginBottom: 0.5
                  }}
                >
                  Lịch giữ trẻ
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'var(--font-family)' }}>
                  Xem và quản lý các ca giữ trẻ được phân công
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Action Buttons and View Mode Toggle */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="chế độ xem"
            size="small"
          >
            <ToggleButton value="card" aria-label="xem danh sách">
              <ViewList sx={{ mr: 1 }} />
              Danh sách
            </ToggleButton>
            <ToggleButton value="schedule" aria-label="xem lịch">
              <CalendarMonth sx={{ mr: 1 }} />
              Lịch
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Table List View */}
        {viewMode === 'card' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Lịch đang diễn ra */}
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#ff9800',
                    boxShadow: '0 0 8px rgba(255, 152, 0, 0.6)'
                  }}
                />
                Đang diễn ra
              </Typography>
              <DataTable
                data={rawSlots.current.slice(
                  pagination.current.page * pagination.current.rowsPerPage,
                  pagination.current.page * pagination.current.rowsPerPage + pagination.current.rowsPerPage
                )}
                columns={tableColumns}
                loading={false}
                emptyMessage="Chưa có ca giữ trẻ đang diễn ra"
                showActions={rawSlots.current.length > 0}
                onEdit={handleCardClick}
                onDelete={null}
                page={pagination.current.page}
                rowsPerPage={pagination.current.rowsPerPage}
                totalCount={rawSlots.current.length}
                onPageChange={(event, newPage) => handlePageChange('current', newPage)}
                onRowsPerPageChange={(event) => handleRowsPerPageChange('current', parseInt(event.target.value, 10))}
                getRowSx={(item) => {
                  return {
                    borderLeft: '4px solid #ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 152, 0, 0.1)'
                    }
                  };
                }}
              />
            </Box>

            {/* Lịch sắp tới */}
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)'
                  }}
                />
                Sắp tới
              </Typography>
              <DataTable
                data={rawSlots.upcoming.slice(
                  pagination.upcoming.page * pagination.upcoming.rowsPerPage,
                  pagination.upcoming.page * pagination.upcoming.rowsPerPage + pagination.upcoming.rowsPerPage
                )}
                columns={tableColumns}
                loading={false}
                emptyMessage="Chưa có ca giữ trẻ sắp tới"
                showActions={rawSlots.upcoming.length > 0}
                onEdit={handleCardClick}
                onDelete={null}
                page={pagination.upcoming.page}
                rowsPerPage={pagination.upcoming.rowsPerPage}
                totalCount={rawSlots.upcoming.length}
                onPageChange={(event, newPage) => handlePageChange('upcoming', newPage)}
                onRowsPerPageChange={(event) => handleRowsPerPageChange('upcoming', parseInt(event.target.value, 10))}
                getRowSx={(item) => {
                  return {
                    borderLeft: '4px solid var(--color-primary)',
                    '&:hover': {
                      backgroundColor: 'rgba(92, 189, 185, 0.1)'
                    }
                  };
                }}
              />
            </Box>

            {/* Lịch đã qua */}
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#9e9e9e'
                  }}
                />
                Đã qua
              </Typography>
              <DataTable
                data={rawSlots.past.slice(
                  pagination.past.page * pagination.past.rowsPerPage,
                  pagination.past.page * pagination.past.rowsPerPage + pagination.past.rowsPerPage
                )}
                columns={tableColumns}
                loading={false}
                emptyMessage="Chưa có ca giữ trẻ đã qua"
                showActions={rawSlots.past.length > 0}
                onEdit={handleCardClick}
                onDelete={null}
                page={pagination.past.page}
                rowsPerPage={pagination.past.rowsPerPage}
                totalCount={rawSlots.past.length}
                onPageChange={(event, newPage) => handlePageChange('past', newPage)}
                onRowsPerPageChange={(event) => handleRowsPerPageChange('past', parseInt(event.target.value, 10))}
                getRowSx={(item) => {
                  return {
                    borderLeft: '4px solid #9e9e9e',
                    backgroundColor: 'rgba(158, 158, 158, 0.05)',
                    opacity: 0.8,
                    '&:hover': {
                      backgroundColor: 'rgba(158, 158, 158, 0.1)',
                      opacity: 1
                    }
                  };
                }}
              />
            </Box>
          </Box>
        )}

        {/* Schedule View */}
        {viewMode === 'schedule' && (
          <Paper 
            elevation={0}
            sx={{
              padding: 2,
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'transparent'
            }}
          >
            <div className={styles.scheduleContainer}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={scheduleData}
                eventClick={handleEventClick}
                selectable={false}
                editable={false}
                droppable={false}
                select={handleDateSelect}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                height="auto"
                locale="vi"
                timeZone="Asia/Ho_Chi_Minh"
                buttonText={{
                  today: 'Hôm nay',
                  month: 'Tháng',
                  week: 'Tuần',
                  day: 'Ngày'
                }}
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventDisplay="block"
                nowIndicator={true}
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
                eventContent={(arg) => {
                  const props = arg.event.extendedProps;
                  const timeframeName = props.timeframeName || '';
                  const studentName = props.studentName || 'Chưa xác định';
                  const roomName = props.roomName || 'Chưa xác định';
                  const timeDisplay = props.timeDisplay || '';
                  
                  return {
                    html: `
                      <div style="
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        gap: 4px;
                        padding: 6px 8px;
                        width: 100%;
                        height: 100%;
                        box-sizing: border-box;
                        color: white;
                        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
                        overflow: visible;
                      ">
                        <div style="
                          font-weight: 600;
                          font-size: 12px;
                          line-height: 1.3;
                          white-space: normal;
                          word-break: break-word;
                          overflow-wrap: break-word;
                        ">
                          ${timeframeName}
                        </div>
                        <div style="
                          font-size: 11px;
                          line-height: 1.3;
                          opacity: 0.95;
                          word-break: break-word;
                          overflow-wrap: break-word;
                          white-space: normal;
                        ">
                          ${timeDisplay}
                        </div>
                        <div style="
                          font-size: 10px;
                          line-height: 1.2;
                          opacity: 0.9;
                          word-break: break-word;
                          overflow-wrap: break-word;
                          white-space: normal;
                        ">
                          ${studentName} - ${roomName}
                        </div>
                      </div>
                    `
                  };
                }}
                views={{
                  timeGridWeek: {
                    slotMinTime: '12:00:00',
                    slotMaxTime: '21:00:00',
                    allDaySlot: false,
                    eventDisplay: 'block'
                  },
                  timeGridDay: {
                    slotMinTime: '12:00:00',
                    slotMaxTime: '21:00:00',
                    allDaySlot: false,
                    eventDisplay: 'block'
                  },
                  dayGridMonth: {
                    eventDisplay: 'block',
                    displayEventTime: true
                  }
                }}
              />
            </div>
          </Paper>
        )}

        {viewMode === 'schedule' && scheduleData.length === 0 && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Chưa có ca giữ trẻ nào được phân công.
          </Alert>
        )}

        {/* Dialog hiển thị danh sách học sinh */}
        <Dialog 
          open={studentsDialogOpen} 
          onClose={handleCloseStudentsDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-xl)'
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" component="div" sx={{ fontFamily: 'var(--font-family-heading)', fontWeight: 600 }}>
              Danh sách học sinh
            </Typography>
            {selectedSlot && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedSlot.branchName} • {selectedSlot.timeframeName} • {selectedSlot.roomName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDateOnlyUTC7(selectedSlot.date, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} • {selectedSlot.timeDisplay}
                </Typography>
              </Box>
            )}
          </DialogTitle>
          <DialogContent>
            {loadingStudents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : studentsList.length === 0 ? (
              <Alert severity="info">
                Không có học sinh nào đã đăng ký cho slot này.
              </Alert>
            ) : (
              <List>
                {studentsList.map((slot, index) => (
                  <React.Fragment key={slot.id || index}>
                    <ListItem
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        py: 2,
                        px: 2,
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <ListItemText
                            primary={
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {slot.studentName || slot.student?.name || 'Chưa có tên'}
                              </Typography>
                            }
                            secondary={
                              <>
                                {slot.parentName && (
                                  <Typography variant="body2" color="text.secondary">
                                    Phụ huynh: {slot.parentName}
                                  </Typography>
                                )}
                                {slot.parentNote && (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Ghi chú: {slot.parentNote}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </Box>
                        <Chip
                          label={slot.status === 'Booked' || slot.status === 'booked' ? 'Đã đăng ký' : slot.status}
                          color={slot.status === 'Booked' || slot.status === 'booked' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </ListItem>
                    {index < studentsList.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStudentsDialog} variant="contained">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffAssignments;
