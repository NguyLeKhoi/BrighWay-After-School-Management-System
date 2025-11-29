import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Divider,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  ArrowBack,
  CalendarToday,
  AccessTime,
  MeetingRoom,
  Business,
  Person,
  CheckCircle
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import studentSlotService from '../../../../services/studentSlot.service';
import { useApp } from '../../../../contexts/AppContext';
import { formatDateOnlyUTC7, extractDateString } from '../../../../utils/dateHelper';
import styles from './AssignmentDetail.module.css';

const AssignmentDetail = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const { showGlobalError } = useApp();
  
  const [slot, setSlot] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!slotId) {
        setError('Thiếu thông tin cần thiết');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Lấy thông tin slot
        const response = await studentSlotService.getStaffSlots({
          pageIndex: 1,
          pageSize: 1000,
          upcomingOnly: false
        });

        const slots = response?.items || [];
        const foundSlot = slots.find(s => s.id === slotId);

        if (!foundSlot) {
          setError('Không tìm thấy ca giữ trẻ này');
          navigate('/staff/assignments');
          return;
        }

        setSlot(foundSlot);
        
        // Load danh sách học sinh cho slot này
        await loadStudents(foundSlot);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin';
        setError(errorMessage);
        showGlobalError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slotId, navigate, showGlobalError]);

  const loadStudents = async (slotData) => {
    if (!slotData) return;

    setLoadingStudents(true);
    try {
      const dateValue = slotData.branchSlot?.date || slotData.date;
      const branchSlotId = slotData.branchSlotId;

      if (!branchSlotId || !dateValue) {
        setStudentsList([]);
        return;
      }

      const response = await studentSlotService.getStaffSlots({
        pageIndex: 1,
        pageSize: 1000,
        branchSlotId: branchSlotId,
        date: dateValue,
        upcomingOnly: false
      });

      const slots = response?.items || [];
      const bookedSlots = slots.filter(s => 
        s.status === 'Booked' || s.status === 'booked'
      );

      setStudentsList(bookedSlots);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách học sinh';
      showGlobalError(errorMessage);
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleBack = () => {
    navigate('/staff/assignments');
  };

  const formatTimeDisplay = (time) => {
    if (!time) return '00:00';
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.container}>
          <ContentLoading isLoading={true} text="Đang tải thông tin..." />
        </div>
      </div>
    );
  }

  if (error || !slot) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.container}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Quay lại
          </Button>
          <Alert severity="error">
            {error || 'Không tìm thấy thông tin'}
          </Alert>
        </div>
      </div>
    );
  }

  // Parse slot data
  const dateValue = slot.branchSlot?.date || slot.date;
  const timeframe = slot.timeframe || slot.timeFrame;
  const roomName = slot.room?.roomName || slot.roomName || slot.branchSlot?.roomName || 'Chưa xác định';
  const branchName = slot.branchSlot?.branchName || slot.branchName || 'Chưa xác định';
  const status = slot.status || 'Booked';
  const timeframeName = timeframe?.name || 'Chưa xác định';
  const startTimeOnly = timeframe?.startTime || '';
  const endTimeOnly = timeframe?.endTime || '';

  const statusLabels = {
    'Booked': 'Đã đăng ký',
    'Confirmed': 'Đã xác nhận',
    'Cancelled': 'Đã hủy',
    'Completed': 'Đã hoàn thành',
    'Pending': 'Chờ xử lý'
  };

  return (
    <div className={styles.detailPage}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
            <Typography 
              variant="h4" 
              component="h1"
              sx={{
                fontFamily: 'var(--font-family-heading)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-primary)'
              }}
            >
              Chi tiết ca giữ trẻ
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Slot Information */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{
                padding: 3,
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-primary)',
                height: '100%'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CheckCircle sx={{ color: 'var(--color-primary)' }} />
                Thông tin ca giữ trẻ
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarToday sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Ngày
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {dateValue ? formatDateOnlyUTC7(dateValue) : 'Chưa xác định'}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {startTimeOnly && endTimeOnly && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AccessTime sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Giờ
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatTimeDisplay(startTimeOnly)} - {formatTimeDisplay(endTimeOnly)}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                  </>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MeetingRoom sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Phòng
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {roomName}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Business sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Chi nhánh
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {branchName}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Trạng thái đăng ký
                    </Typography>
                    <Chip
                      label={statusLabels[status] || status}
                      size="small"
                      sx={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Students List */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{
                padding: 3,
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-primary)',
                height: '100%'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Person sx={{ color: 'var(--color-primary)' }} />
                Danh sách học sinh ({studentsList.length})
              </Typography>

              {loadingStudents ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Đang tải danh sách học sinh...
                  </Typography>
                </Box>
              ) : studentsList.length === 0 ? (
                <Alert severity="info">
                  Không có học sinh nào đã đăng ký cho ca này.
                </Alert>
              ) : (
                <List sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {studentsList.map((studentSlot, index) => (
                    <React.Fragment key={studentSlot.id || index}>
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
                                  {studentSlot.studentName || studentSlot.student?.name || 'Chưa có tên'}
                                </Typography>
                              }
                              secondary={
                                <>
                                  {studentSlot.parentName && (
                                    <Typography variant="body2" color="text.secondary">
                                      Phụ huynh: {studentSlot.parentName}
                                    </Typography>
                                  )}
                                  {studentSlot.parentNote && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                                      Ghi chú: {studentSlot.parentNote}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                          </Box>
                          <Chip
                            label={studentSlot.status === 'Booked' || studentSlot.status === 'booked' ? 'Đã đăng ký' : studentSlot.status}
                            color={studentSlot.status === 'Booked' || studentSlot.status === 'booked' ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </ListItem>
                      {index < studentsList.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default AssignmentDetail;

