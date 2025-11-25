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
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentSlotService from '../../../services/studentSlot.service';
import activityService from '../../../services/activity.service';
import activityTypeService from '../../../services/activityType.service';
import imageService from '../../../services/image.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import ImageUpload from '../../../components/Common/ImageUpload';
import styles from './assignments.module.css';

const StaffAssignments = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [checkedStudents, setCheckedStudents] = useState(new Set()); // Track checked students
  const [checkingIn, setCheckingIn] = useState(new Set()); // Track students being checked in
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedStudentSlot, setSelectedStudentSlot] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loadingActivityTypes, setLoadingActivityTypes] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activityTypeId: '',
    note: '',
    imageFile: null
  });
  const [submittingActivity, setSubmittingActivity] = useState(false);
  const { isLoading, showLoading, hideLoading } = useLoading();
  const { showGlobalError } = useApp();
  const { user } = useAuth();

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
        console.warn('Slot missing date:', slot);
        return;
      }

      const branchSlotId = slot.branchSlotId;
      if (!branchSlotId) {
        console.warn('Slot missing branchSlotId:', slot);
        return;
      }

      // Tạo key để group: branchSlotId + date (chỉ lấy phần date, không có time)
      const slotDate = new Date(dateValue);
      if (isNaN(slotDate.getTime())) {
        console.warn('Invalid date format:', dateValue);
        return;
      }

      const dateStr = slotDate.toISOString().split('T')[0];
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
          console.warn('Slot missing timeframe:', firstSlot);
          return null;
        }

        const dateValue = firstSlot.date;
        const slotDate = new Date(dateValue);
        const dateStr = slotDate.toISOString().split('T')[0];

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
    fetchActivityTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchActivityTypes = async () => {
    try {
      setLoadingActivityTypes(true);
      const data = await activityTypeService.getAllActivityTypes();
      setActivityTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching activity types:', err);
      toast.error('Không thể tải danh sách loại hoạt động', {
        position: 'top-right',
        autoClose: 4000
      });
    } finally {
      setLoadingActivityTypes(false);
    }
  };

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
    setCheckedStudents(new Set());
    setCheckingIn(new Set());
  };

  // Handle checkin checkbox
  const handleCheckinToggle = async (slot, checked) => {
    if (!slot.studentId) {
      toast.error('Không tìm thấy ID học sinh', {
        position: 'top-right',
        autoClose: 4000
      });
      return;
    }

    if (checked) {
      // Check in student
      setCheckingIn(prev => new Set(prev).add(slot.studentId));
      try {
        await activityService.checkinStaff(slot.studentId);
        
        // Update checked state
        setCheckedStudents(prev => new Set(prev).add(slot.studentId));
        
        toast.success(`Đã điểm danh cho ${slot.studentName || 'học sinh'}`, {
          position: 'top-right',
          autoClose: 3000
        });
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể điểm danh';
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000
        });
      } finally {
        setCheckingIn(prev => {
          const newSet = new Set(prev);
          newSet.delete(slot.studentId);
          return newSet;
        });
      }
    } else {
      // Uncheck - just remove from checked set
      setCheckedStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(slot.studentId);
        return newSet;
      });
    }
  };

  // Handle click on student slot to create activity
  const handleCreateActivity = (slot) => {
    setSelectedStudentSlot(slot);
    setActivityForm({
      activityTypeId: '',
      note: '',
      imageFile: null
    });
    setActivityDialogOpen(true);
  };

  const handleCloseActivityDialog = () => {
    setActivityDialogOpen(false);
    setSelectedStudentSlot(null);
    setActivityForm({
      activityTypeId: '',
      note: '',
      imageFile: null
    });
  };

  const handleSubmitActivity = async () => {
    if (!selectedStudentSlot) {
      toast.error('Vui lòng chọn học sinh', {
        position: 'top-right',
        autoClose: 4000
      });
      return;
    }

    if (!activityForm.activityTypeId) {
      toast.error('Vui lòng chọn loại hoạt động', {
        position: 'top-right',
        autoClose: 4000
      });
      return;
    }

    if (!user?.id) {
      toast.error('Không thể xác định người dùng', {
        position: 'top-right',
        autoClose: 4000
      });
      return;
    }

    setSubmittingActivity(true);
    try {
      let imageUrl = '';

      // Upload image file if exists
      if (activityForm.imageFile) {
        try {
          imageUrl = await imageService.uploadImage(activityForm.imageFile);
          if (!imageUrl) {
            throw new Error('Không nhận được URL ảnh từ server');
          }
        } catch (uploadError) {
          const errorMessage = uploadError?.response?.data?.message || uploadError?.message || 'Không thể upload ảnh';
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 4000
          });
          throw uploadError;
        }
      }

      // Create activity
      await activityService.createActivity({
        activityTypeId: activityForm.activityTypeId,
        studentSlotId: selectedStudentSlot.id,
        note: activityForm.note || '',
        imageUrl: imageUrl,
        createdById: user.id
      });

      toast.success('Tạo hoạt động thành công!', {
        position: 'top-right',
        autoClose: 3000
      });

      handleCloseActivityDialog();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tạo hoạt động';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
      console.error('Error creating activity:', err);
    } finally {
      setSubmittingActivity(false);
    }
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
      <div className={styles.schedulePage}>
        <div className={styles.container}>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.schedulePage}>
      <div className={styles.container}>
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
        >
          <DialogTitle>
            <Typography variant="h6" component="div">
              Danh sách học sinh - Điểm danh
            </Typography>
            {selectedSlot && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedSlot.branchName} • {selectedSlot.timeframeName} • {selectedSlot.roomName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(selectedSlot.date).toLocaleDateString('vi-VN', {
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
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={checkedStudents.has(slot.studentId)}
                                onChange={(e) => handleCheckinToggle(slot, e.target.checked)}
                                disabled={checkingIn.has(slot.studentId)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {slot.studentName || 'Chưa có tên'}
                              </Typography>
                            }
                            sx={{ margin: 0 }}
                          />
                          {checkingIn.has(slot.studentId) && (
                            <CircularProgress size={20} />
                          )}
                        </Box>
                        <Chip
                          label={slot.status === 'Booked' || slot.status === 'booked' ? 'Đã đăng ký' : slot.status}
                          color={slot.status === 'Booked' || slot.status === 'booked' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
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
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<AddPhotoIcon />}
                        onClick={() => handleCreateActivity(slot)}
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Tạo hoạt động
                      </Button>
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

        {/* Dialog tạo hoạt động */}
        <Dialog 
          open={activityDialogOpen} 
          onClose={handleCloseActivityDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" component="div">
              Tạo hoạt động cho học sinh
            </Typography>
            {selectedStudentSlot && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedStudentSlot.studentName || 'Chưa có tên'}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* Activity Type Selection */}
              <FormControl fullWidth required>
                <InputLabel>Loại hoạt động</InputLabel>
                <Select
                  value={activityForm.activityTypeId}
                  onChange={(e) => setActivityForm({ ...activityForm, activityTypeId: e.target.value })}
                  label="Loại hoạt động"
                  disabled={loadingActivityTypes || submittingActivity}
                >
                  {loadingActivityTypes ? (
                    <MenuItem disabled>Đang tải...</MenuItem>
                  ) : activityTypes.length === 0 ? (
                    <MenuItem disabled>Không có loại hoạt động</MenuItem>
                  ) : (
                    activityTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name || 'Chưa có tên'}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* Note */}
              <TextField
                label="Ghi chú"
                placeholder="Ví dụ: Nay cháu ăn uống tốt"
                multiline
                rows={4}
                value={activityForm.note}
                onChange={(e) => setActivityForm({ ...activityForm, note: e.target.value })}
                disabled={submittingActivity}
                fullWidth
              />

              {/* Image Upload */}
              <ImageUpload
                label="Ảnh hoạt động"
                helperText="Chọn ảnh để tải lên cho phụ huynh xem"
                value={activityForm.imageFile}
                onChange={(file) => setActivityForm({ ...activityForm, imageFile: file })}
                disabled={submittingActivity}
                required={false}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseActivityDialog} 
              disabled={submittingActivity}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitActivity} 
              variant="contained"
              disabled={submittingActivity || !activityForm.activityTypeId}
            >
              {submittingActivity ? 'Đang tạo...' : 'Tạo hoạt động'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffAssignments;
