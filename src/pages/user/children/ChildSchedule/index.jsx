import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, CircularProgress, Alert, Typography, Button, Paper, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ArrowBack, Add, ViewList, CalendarMonth, CalendarToday, AccessTime, MeetingRoom, Business, Person, CheckCircle } from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import DataTable from '../../../../components/Common/DataTable';
import studentService from '../../../../services/student.service';
import studentSlotService from '../../../../services/studentSlot.service';
import { useApp } from '../../../../contexts/AppContext';
import { extractDateString, formatDateOnlyUTC7 } from '../../../../utils/dateHelper';
import styles from './ChildSchedule.module.css';

const ChildSchedule = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  const { showGlobalError, addNotification } = useApp();

  // Redirect if no childId
  useEffect(() => {
    if (!childId) {
      navigate('/user/management/schedule');
    }
  }, [childId, navigate]);
  const [child, setChild] = useState(null);
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

  // Màu sắc cho các trạng thái khác nhau - sử dụng màu teal cho tất cả
  const getStatusColor = (status) => {
    // Tất cả events đều dùng màu teal
    return 'var(--color-primary)';
  };

  // Xác định loại lịch: past, current, upcoming
  const getSlotTimeType = (slot) => {
    const dateValue = slot.branchSlot?.date || slot.date;
    const timeframe = slot.timeframe || slot.timeFrame;
    
    if (!dateValue || !timeframe) return 'upcoming';
    
    try {
      // Parse date và time
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
      
      // Tạo datetime objects (UTC+7)
      const startDateTime = new Date(`${dateStr}T${formattedStartTime}+07:00`);
      const endDateTime = new Date(`${dateStr}T${formattedEndTime}+07:00`);
      const now = new Date();
      
      // So sánh với thời gian hiện tại
      if (endDateTime < now) {
        return 'past'; // Đã qua
      } else if (startDateTime <= now && now <= endDateTime) {
        return 'current'; // Đang diễn ra
      } else {
        return 'upcoming'; // Sắp tới
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

  // Chuyển đổi student slot từ API sang format FullCalendar
  const transformSlotToEvent = (slot) => {
    // Lấy date từ branchSlot.date hoặc slot.date
    const dateValue = slot.branchSlot?.date || slot.date;
    if (!dateValue) {
      return null;
    }

    // Lấy timeframe từ slot.timeframe hoặc slot.timeFrame
    const timeframe = slot.timeframe || slot.timeFrame;
    if (!timeframe) {
      return null;
    }

    // Parse date string từ UTC+7 (BE timezone) để tránh timezone issues
    const dateStr = extractDateString(dateValue);
    if (!dateStr) {
        return null;
    }
    
    // Lấy startTime và endTime từ timeframe
    const startTime = timeframe.startTime || '00:00:00';
    const endTime = timeframe.endTime || '00:00:00';
    
    // Đảm bảo time format đúng (HH:MM:SS)
    const formatTime = (time) => {
      if (!time) return '00:00:00';
      // Nếu chỉ có HH:MM, thêm :00
      if (time.length === 5) return time + ':00';
      return time;
    };
    
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    
    // Tạo datetime string cho FullCalendar
    const startDateTime = `${dateStr}T${formattedStartTime}`;
    const endDateTime = `${dateStr}T${formattedEndTime}`;

    const status = slot.status || 'Booked';
    const backgroundColor = getStatusColor(status);

    // Lấy room name từ slot.room hoặc slot.branchSlot
    const roomName = slot.room?.roomName || slot.roomName || slot.branchSlot?.roomName || 'Chưa xác định';
    
    // Lấy branch name
    const branchName = slot.branchSlot?.branchName || slot.branchName || 'Chưa xác định';

    // Format time để hiển thị (HH:MM)
    const formatTimeDisplay = (time) => {
      if (!time) return '00:00';
      // Lấy HH:MM từ HH:MM:SS
      return time.substring(0, 5);
    };

    const timeDisplay = `${formatTimeDisplay(startTime)}-${formatTimeDisplay(endTime)}`;

    // Lấy staff names
    const staffNames = (slot.staffs || []).map(s => s.staffName || s.name || '').filter(Boolean);

    // Title sẽ được custom render trong eventContent
    const title = `${timeDisplay} ${roomName}`;

    // Xác định loại lịch (past, current, upcoming)
    const timeType = getSlotTimeType(slot);
    const timeTypeColor = getTimeTypeColor(timeType);

    return {
      id: slot.id,
      title: title, // Title cho fallback, sẽ custom trong eventContent
      start: startDateTime,
      end: endDateTime,
      backgroundColor: timeTypeColor,
      borderColor: timeTypeColor,
      textColor: 'white', // Chữ màu trắng
      display: 'block', // Hiển thị full trong slot
      classNames: ['custom-event', `event-${timeType}`], // Thêm class để có thể style thêm
      extendedProps: {
        status: status,
        roomName: roomName,
        branchName: branchName,
        parentNote: slot.parentNote || '',
        studentName: slot.studentName || child?.name || '',
        timeframe: timeframe,
        staffs: slot.staffs || [],
        staffNames: staffNames,
        parentName: slot.parentName || '',
        timeDisplay: timeDisplay,
        timeType: timeType // Thêm timeType vào extendedProps
      }
    };
  };

  const fetchChild = async () => {
    if (!childId) {
      navigate('/user/management/children');
      return;
    }

    try {
      // Kiểm tra xem childId có thuộc về user hiện tại không
      // Bằng cách lấy danh sách con của user và kiểm tra
      const myChildren = await studentService.getMyChildren();
      const childIds = Array.isArray(myChildren) 
        ? myChildren.map(c => c.id) 
        : [];
      
      if (!childIds.includes(childId)) {
        // Nếu childId không thuộc về user, chuyển về trang danh sách
        toast.error('Bạn không có quyền xem thông tin trẻ em này', {
          position: 'top-right',
          autoClose: 3000
        });
        navigate('/user/management/children');
        return;
      }

      const data = await studentService.getMyChildById(childId);
      setChild(data);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin trẻ em';
      setError(errorMessage);
      showGlobalError(errorMessage);
      
      // Nếu lỗi 403 hoặc 404, có thể là do không có quyền truy cập
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        navigate('/user/management/children');
      }
    }
  };

  // Hàm helper để load tất cả các trang
  const fetchAllStudentSlots = async (childId) => {
    const allSlots = [];
    let pageIndex = 1;
    const pageSize = 100; // Kích thước trang hợp lý
    let hasMore = true;
    let totalCount = 0;
    let totalPages = 0;

    while (hasMore) {
      const response = await studentSlotService.getStudentSlots({
        StudentId: childId,
        pageIndex: pageIndex,
        pageSize: pageSize
      });

      const items = response?.items || [];
      
      // Lấy totalCount và totalPages từ response (nếu có)
      if (pageIndex === 1) {
        totalCount = response?.totalCount || 0;
        totalPages = response?.totalPages;
        
        // Nếu không có totalPages, tính toán từ totalCount
        if (!totalPages && totalCount > 0) {
          totalPages = Math.ceil(totalCount / pageSize);
        }
      }

      if (items.length > 0) {
        allSlots.push(...items);
      }

      // Kiểm tra xem còn trang nào không
      // Nếu có totalPages, dùng nó để kiểm tra
      if (totalPages > 0) {
        if (pageIndex >= totalPages) {
          hasMore = false;
        } else {
          pageIndex++;
        }
      } else {
        // Nếu không có totalPages, kiểm tra dựa vào số items trả về
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
    if (!childId) return;

    try {
      setLoading(true);
      setError(null);

      // Kiểm tra lại quyền truy cập trước khi lấy lịch học
      const myChildren = await studentService.getMyChildren();
      const childIds = Array.isArray(myChildren) 
        ? myChildren.map(c => c.id) 
        : [];
      
      if (!childIds.includes(childId)) {
        // Nếu childId không thuộc về user, không lấy lịch học
        setError('Bạn không có quyền xem lịch chăm sóc của trẻ em này');
        navigate('/user/management/children');
        return;
      }

      // Lấy tất cả student slots của trẻ em này (load tất cả các trang)
      const slots = await fetchAllStudentSlots(childId);
      const events = slots
        .map(transformSlotToEvent)
        .filter(Boolean); // Loại bỏ các event null

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

      // Sắp xếp: past (mới nhất trước), current, upcoming (sớm nhất trước)
      pastSlots.sort((a, b) => {
        const dateA = new Date(a.branchSlot?.date || a.date || 0);
        const dateB = new Date(b.branchSlot?.date || b.date || 0);
        return dateB - dateA; // Mới nhất trước
      });

      upcomingSlots.sort((a, b) => {
        const dateA = new Date(a.branchSlot?.date || a.date || 0);
        const dateB = new Date(b.branchSlot?.date || b.date || 0);
        return dateA - dateB; // Sớm nhất trước
      });

      setRawSlots({
        past: pastSlots,
        current: currentSlots,
        upcoming: upcomingSlots,
        all: slots // Giữ lại để dùng cho calendar view và các tính toán khác
      });
      setScheduleData(events);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải lịch học';
      setError(errorMessage);
      showGlobalError(errorMessage);
      
      // Nếu lỗi 403 hoặc 404, có thể là do không có quyền truy cập
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        navigate('/user/management/children');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchChild();
      await fetchSchedule();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  // Reload data when navigate back to this page
  useEffect(() => {
    if (location.pathname === `/user/management/schedule/${childId}`) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleBack = () => {
    navigate('/user/management/children');
  };

  // Event handlers cho FullCalendar
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const slotId = event.id;
    navigate(`/user/management/schedule/${childId}/${slotId}`);
  };

  // Handler cho card click
  const handleCardClick = (slot) => {
    const slotId = slot.id;
    navigate(`/user/management/schedule/${childId}/${slotId}`);
  };

  // Handler cho view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
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
        key: 'staffs',
        header: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person fontSize="small" />
            <span>Nhân viên</span>
          </Box>
        ),
        render: (value, item) => {
          const staffNames = (item.staffs || []).map(s => s.staffName || s.name || '').filter(Boolean);
          return staffNames.length > 0 ? staffNames.join(', ') : 'Chưa có';
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


  // Ngăn chặn drag & drop và các thao tác chỉnh sửa
  const handleDateSelect = () => {
    // Ngăn chặn tạo event mới
    return false;
  };

  const handleEventDrop = (dropInfo) => {
    // Ngăn chặn drag & drop
    dropInfo.revert();
  };

  const handleEventResize = (resizeInfo) => {
    // Ngăn chặn resize
    resizeInfo.revert();
  };

  if (loading) {
    return (
      <div className={styles.schedulePage}>
        <div className={styles.container}>
          <ContentLoading isLoading={true} text="Đang tải lịch học..." />
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className={styles.schedulePage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <button className={styles.backButton} onClick={handleBack}>
              ← Quay lại
            </button>
          </div>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || 'Không tìm thấy thông tin trẻ em'}
          </Alert>
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
                onClick={handleBack}
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
                  Lịch chăm sóc của {child.name || 'Trẻ em'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={child.studentLevelName || child.studentLevel?.name || 'Chưa xác định'}
                    size="small"
                    sx={{
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-dark)',
                      fontFamily: 'var(--font-family)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'var(--font-family)' }}>
                    •
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontFamily: 'var(--font-family)' }}
                  >
                    {child.branchName || child.branch?.branchName || 'Chưa có chi nhánh'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons and View Mode Toggle */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => navigate(`/user/management/schedule/${childId}/register`)}
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
              Đăng ký ca chăm sóc
            </Button>
          </Box>
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
                data={rawSlots.current}
              columns={tableColumns}
                loading={false}
                emptyMessage="Chưa có lịch đang diễn ra"
                showActions={rawSlots.current.length > 0}
              onEdit={handleCardClick}
              onDelete={null}
              page={0}
                rowsPerPage={rawSlots.current.length || 10}
                totalCount={rawSlots.current.length}
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
                data={rawSlots.upcoming}
                columns={tableColumns}
                loading={false}
                emptyMessage="Chưa có lịch sắp tới"
                showActions={rawSlots.upcoming.length > 0}
                onEdit={handleCardClick}
                onDelete={null}
                page={0}
                rowsPerPage={rawSlots.upcoming.length || 10}
                totalCount={rawSlots.upcoming.length}
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
                data={rawSlots.past}
                columns={tableColumns}
                loading={false}
                emptyMessage="Chưa có lịch đã qua"
                showActions={rawSlots.past.length > 0}
                onEdit={handleCardClick}
                onDelete={null}
                page={0}
                rowsPerPage={rawSlots.past.length || 10}
                totalCount={rawSlots.past.length}
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
              // Bỏ giới hạn slotMinTime và slotMaxTime để hiển thị tất cả events
              // slotMinTime='00:00:00'
              // slotMaxTime='24:00:00'
              allDaySlot={false}
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }}
              // Custom event content để hiển thị đầy đủ thông tin
              eventContent={(arg) => {
                const props = arg.event.extendedProps;
                const timeDisplay = props.timeDisplay || '';
                const roomName = props.roomName || 'Chưa xác định';
                const staffNames = props.staffNames || [];
                
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
                        ${roomName}
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
                      ${staffNames.length > 0 ? `
                        <div style="
                          font-size: 10px;
                          line-height: 1.2;
                          opacity: 0.9;
                          word-break: break-word;
                          overflow-wrap: break-word;
                          white-space: normal;
                        ">
                          Phụ trách bởi: ${staffNames.join(', ')}
              </div>
                      ` : ''}
              </div>
                  `
                };
              }}
              // Cấu hình cho timeGrid views - giới hạn từ 12h trưa đến 21h tối (quản lý trẻ sau giờ học)
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
            Chưa có lịch chăm sóc nào được đăng ký cho trẻ em này.
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ChildSchedule;
