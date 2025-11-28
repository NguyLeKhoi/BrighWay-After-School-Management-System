import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import studentSlotService from '../../../services/studentSlot.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import { useApp } from '../../../contexts/AppContext';
import { extractDateString, formatDateOnlyUTC7 } from '../../../utils/dateHelper';
import styles from './assignments.module.css';
import PageWrapper from '../../../components/Common/PageWrapper';
import ManagementPageHeader from '../../../components/Management/PageHeader';

const StaffAssignments = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const { isLoading, showLoading, hideLoading } = useLoading();
  const { showGlobalError } = useApp();

  // Màu sắc cho các trạng thái
  const getStatusColor = (status) => {
    return 'var(--color-primary)';
  };

  // Chuyển đổi student slot từ API sang format FullCalendar
  // Group các slots theo branchSlotId và date để tạo một event duy nhất
  const transformSlotsToEvents = (slots) => {
    // Group slots theo branchSlotId và date
    const groupedSlots = {};
    
    slots.forEach((slot) => {
      const dateValue = slot.date;
      if (!dateValue) {
        return;
      }

      const branchSlotId = slot.branchSlotId;
      if (!branchSlotId) {
        return;
      }

      // Parse date string từ UTC+7 (BE timezone) để tránh timezone issues
      const dateStr = extractDateString(dateValue);
      if (!dateStr) {
        return;
      }
      const groupKey = `${branchSlotId}_${dateStr}`;

      if (!groupedSlots[groupKey]) {
        groupedSlots[groupKey] = [];
      }
      groupedSlots[groupKey].push(slot);
    });

    // Chuyển đổi mỗi group thành một event
    const events = Object.values(groupedSlots)
      .map((groupSlots) => {
        if (groupSlots.length === 0) return null;

        const firstSlot = groupSlots[0];
        const timeframe = firstSlot.timeframe;
        if (!timeframe) {
          return null;
        }

        const dateValue = firstSlot.date;
        // Parse date string từ UTC+7 (BE timezone) để tránh timezone issues
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

        const roomName = firstSlot.room?.roomName || 'Chưa xác định';
        const branchName = firstSlot.branchSlot?.branchName || 'Chưa xác định';
        const timeframeName = timeframe.name || 'Chưa xác định';

        const formatTimeDisplay = (time) => {
          if (!time) return '00:00';
          return time.substring(0, 5);
        };

        const timeDisplay = `${formatTimeDisplay(startTime)}-${formatTimeDisplay(endTime)}`;
        const studentCount = groupSlots.length;

        // Title hiển thị trên calendar
        const title = `${timeframeName} - ${studentCount} học sinh`;

        return {
          id: `${firstSlot.branchSlotId}_${dateStr}`,
          title: title,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: getStatusColor('Booked'),
          borderColor: getStatusColor('Booked'),
          textColor: 'white',
          display: 'block',
          classNames: ['custom-event'],
          extendedProps: {
            branchSlotId: firstSlot.branchSlotId,
            date: dateStr,
            dateTime: dateValue,
            roomName: roomName,
            branchName: branchName,
            timeframe: timeframe,
            timeframeName: timeframeName,
            timeDisplay: timeDisplay,
            studentCount: studentCount,
            slots: groupSlots // Lưu tất cả slots trong group này
          }
        };
      })
      .filter(Boolean);

    return events;
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoading();

      // Lấy tất cả slots (lấy nhiều để có đủ dữ liệu)
      const response = await studentSlotService.getStaffSlots({
        pageIndex: 1,
        pageSize: 1000,
        upcomingOnly: false
      });

      const slots = response?.items || [];
      const events = transformSlotsToEvents(slots);

      setScheduleData(events);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải lịch làm việc';
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
    const props = event.extendedProps;

    setSelectedSlot({
      branchSlotId: props.branchSlotId,
      date: props.dateTime,
      dateStr: props.date,
      roomName: props.roomName,
      branchName: props.branchName,
      timeframe: props.timeframe,
      timeframeName: props.timeframeName,
      timeDisplay: props.timeDisplay
    });

    // Fetch danh sách học sinh cho slot này
    await fetchStudentsForSlot(props.branchSlotId, props.dateTime);
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
      // Filter chỉ lấy các slot có status Booked
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

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Loading />
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
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
        <ManagementPageHeader
          title="Lịch Làm Việc"
        />
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* FullCalendar Component */}
        <Paper 
          elevation={0}
          sx={{
            padding: 2,
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)',
            boxShadow: 'var(--shadow-sm)',
            mt: 3
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
                const studentCount = props.studentCount || 0;
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
                        ${studentCount} học sinh - ${roomName}
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

        {scheduleData.length === 0 && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Chưa có lịch làm việc nào.
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
                                {slot.studentName || 'Chưa có tên'}
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
      </Box>
    </PageWrapper>
  );
};

export default StaffAssignments;
