import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import studentService from '../../../../services/student.service';
import studentSlotService from '../../../../services/studentSlot.service';
import { useApp } from '../../../../contexts/AppContext';
import styles from './ChildSchedule.module.css';

const ChildSchedule = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  const { showGlobalError } = useApp();
  const [child, setChild] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Màu sắc cho các trạng thái khác nhau
  const getStatusColor = (status) => {
    const statusColors = {
      'Booked': '#1976d2',
      'Confirmed': '#2e7d32',
      'Cancelled': '#d32f2f',
      'Completed': '#ed6c02',
      'Pending': '#ed6c02'
    };
    return statusColors[status] || '#757575';
  };

  // Chuyển đổi student slot từ API sang format FullCalendar
  const transformSlotToEvent = (slot) => {
    if (!slot.date || !slot.timeFrame) {
      return null;
    }

    const dateStr = slot.date.split('T')[0]; // Lấy phần date
    const startTime = slot.timeFrame.startTime || '00:00:00';
    const endTime = slot.timeFrame.endTime || '00:00:00';
    
    // Tạo datetime string cho FullCalendar
    const startDateTime = `${dateStr}T${startTime}`;
    const endDateTime = `${dateStr}T${endTime}`;

    const status = slot.status || 'Booked';
    const backgroundColor = getStatusColor(status);

    return {
      id: slot.id,
      title: slot.roomName || slot.branchSlot?.roomName || 'Lịch học',
      start: startDateTime,
      end: endDateTime,
      backgroundColor: backgroundColor,
      borderColor: backgroundColor,
      extendedProps: {
        status: status,
        roomName: slot.roomName || slot.branchSlot?.roomName || 'Chưa xác định',
        branchName: slot.branchSlot?.branchName || slot.branchName || 'Chưa xác định',
        parentNote: slot.parentNote || '',
        studentName: slot.studentName || child?.name || '',
        timeFrame: slot.timeFrame
      }
    };
  };

  const fetchChild = async () => {
    if (!childId) {
      navigate('/family/children');
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
        toast.error('Bạn không có quyền xem thông tin học sinh này', {
          position: 'top-right',
          autoClose: 3000
        });
        navigate('/family/children');
        return;
      }

      const data = await studentService.getMyChildById(childId);
      setChild(data);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin học sinh';
      setError(errorMessage);
      showGlobalError(errorMessage);
      console.error('Error fetching child:', err);
      
      // Nếu lỗi 403 hoặc 404, có thể là do không có quyền truy cập
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        navigate('/family/children');
      }
    }
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
        setError('Bạn không có quyền xem lịch học của học sinh này');
        navigate('/family/children');
        return;
      }

      // Lấy tất cả student slots của học sinh này
      const response = await studentSlotService.getStudentSlots({
        StudentId: childId,
        pageIndex: 1,
        pageSize: 1000 // Lấy nhiều để có đủ dữ liệu
      });

      const slots = response?.items || [];
      const events = slots
        .map(transformSlotToEvent)
        .filter(Boolean); // Loại bỏ các event null

      setScheduleData(events);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải lịch học';
      setError(errorMessage);
      showGlobalError(errorMessage);
      console.error('Error fetching schedule:', err);
      
      // Nếu lỗi 403 hoặc 404, có thể là do không có quyền truy cập
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        navigate('/family/children');
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
    if (location.pathname === `/family/children/${childId}/schedule`) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleBack = () => {
    navigate('/family/children');
  };

  // Event handlers cho FullCalendar
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const startTime = event.start.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = event.end.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const props = event.extendedProps;
    const statusLabels = {
      'Booked': 'Đã đăng ký',
      'Confirmed': 'Đã xác nhận',
      'Cancelled': 'Đã hủy',
      'Completed': 'Đã hoàn thành',
      'Pending': 'Chờ xử lý'
    };

    const message = [
      `Phòng học: ${props.roomName || 'Chưa xác định'}`,
      `Chi nhánh: ${props.branchName || 'Chưa xác định'}`,
      `Thời gian: ${startTime} - ${endTime}`,
      `Trạng thái: ${statusLabels[props.status] || props.status || 'Chưa xác định'}`,
      props.parentNote ? `Ghi chú: ${props.parentNote}` : ''
    ].filter(Boolean).join('\n');
    
    alert(message);
  };

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
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
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
            {error || 'Không tìm thấy thông tin học sinh'}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.schedulePage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Quay lại
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Lịch học của {child.name || 'Học sinh'}</h1>
            <p className={styles.subtitle}>
              {child.studentLevelName || child.studentLevel?.name || 'Chưa xác định'} • {child.branchName || child.branch?.branchName || 'Chưa có chi nhánh'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.registerButton}
              onClick={() => navigate(`/family/children/${childId}/schedule/register`)}
            >
              + Đăng ký ca học
            </button>
          <div className={styles.viewInfo}>
            <span className={styles.infoText}>Chế độ xem</span>
            </div>
          </div>
        </div>

        {/* FullCalendar Component */}
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
             slotMinTime='17:00:00'
             slotMaxTime='21:00:00'
             businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '17:00',
              endTime: '21:00'
            }}
          />
        </div>

        {/* Legend */}
        {scheduleData.length > 0 && (
          <div className={styles.legend}>
            <h3 className={styles.legendTitle}>Chú thích trạng thái:</h3>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#1976d2' }}></span>
                <span>Đã đăng ký</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#2e7d32' }}></span>
                <span>Đã xác nhận</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#ed6c02' }}></span>
                <span>Chờ xử lý / Đã hoàn thành</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#d32f2f' }}></span>
                <span>Đã hủy</span>
              </div>
            </div>
          </div>
        )}
        
        {scheduleData.length === 0 && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Chưa có lịch học nào được đăng ký cho học sinh này.
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ChildSchedule;
