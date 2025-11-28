import React, { useState, useEffect } from 'react';
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
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Avatar,
  Collapse,
  InputAdornment,
  Pagination,
  Stack
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Event as EventIcon
} from '@mui/icons-material';
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
import { extractDateString, formatDateOnlyUTC7, formatDateTimeUTC7 } from '../../../utils/dateHelper';
import PageWrapper from '../../../components/Common/PageWrapper';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import AnimatedCard from '../../../components/Common/AnimatedCard';

const StaffActivities = () => {
  const [slotsList, setSlotsList] = useState([]);
  const [allSlotsList, setAllSlotsList] = useState([]); // For FE pagination
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Items per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasApiPagination, setHasApiPagination] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [filteredStudentsList, setFilteredStudentsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState(new Set());
  
  // Activity management
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityDetailDialogOpen, setActivityDetailDialogOpen] = useState(false);
  const [activityEditDialogOpen, setActivityEditDialogOpen] = useState(false);
  const [activityDeleteDialogOpen, setActivityDeleteDialogOpen] = useState(false);
  const [selectedStudentSlot, setSelectedStudentSlot] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activitiesByStudent, setActivitiesByStudent] = useState({});
  const [loadingActivities, setLoadingActivities] = useState({});
  
  // Activity types
  const [activityTypes, setActivityTypes] = useState([]);
  const [loadingActivityTypes, setLoadingActivityTypes] = useState(false);
  
  // Forms
  const [activityForm, setActivityForm] = useState({
    activityTypeId: '',
    note: '',
    imageFile: null
  });
  
  // Check-in state
  const [checkedStudents, setCheckedStudents] = useState(new Set());
  const [checkingIn, setCheckingIn] = useState(new Set());
  
  // Loading states
  const [submittingActivity, setSubmittingActivity] = useState(false);
  const [deletingActivity, setDeletingActivity] = useState(false);
  
  const { isLoading, showLoading, hideLoading } = useLoading();
  const { showGlobalError } = useApp();
  const { user } = useAuth();

  // Group slots by branchSlotId, date, and timeframe
  const groupSlots = (slots) => {
    const grouped = {};
    slots.forEach(slot => {
      if (!slot.branchSlotId || !slot.date || !slot.timeframe) return;
      
      const dateStr = extractDateString(slot.date);
      if (!dateStr) return;
      
      const timeframeId = slot.timeframe.id || slot.timeframeId;
      const key = `${slot.branchSlotId}_${dateStr}_${timeframeId}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          branchSlotId: slot.branchSlotId,
          branchSlotName: slot.branchSlot?.branchName || slot.branchSlot?.name || 'Chưa xác định',
          date: dateStr,
          dateFull: slot.date,
          timeframe: slot.timeframe,
          timeframeName: slot.timeframe?.name || 'Chưa xác định',
          startTime: slot.timeframe?.startTime || '',
          endTime: slot.timeframe?.endTime || '',
          roomName: slot.room?.roomName || 'Chưa xác định',
          studentCount: 0
        };
      }
      grouped[key].studentCount++;
    });

    // Convert to array and sort by date (newest first)
    return Object.values(grouped).sort((a, b) => {
      const dateA = new Date(a.dateFull);
      const dateB = new Date(b.dateFull);
      return dateB - dateA;
    });
  };

  // Load slots grouped by date and time
  const fetchSlots = async (pageIndex = 1) => {
    try {
      setLoading(true);
      setError(null);
      showLoading();

      const response = await studentSlotService.getStaffSlots({
        pageIndex: pageIndex,
        pageSize: pageSize,
        upcomingOnly: false
      });

      const slots = response?.items || [];
      
      // Check if API supports pagination
      const hasPagination = response?.totalPages !== undefined || response?.totalCount !== undefined;
      setHasApiPagination(hasPagination);

      if (hasPagination) {
        // API pagination
        setTotalPages(response?.totalPages || 1);
        setTotalCount(response?.totalCount || 0);
        
        const groupedSlots = groupSlots(slots);
        setSlotsList(groupedSlots);
      } else {
        // FE pagination - load all data first time
        if (pageIndex === 1) {
          // Load all data for FE pagination
          const allResponse = await studentSlotService.getStaffSlots({
            pageIndex: 1,
            pageSize: 10000, // Large number to get all
            upcomingOnly: false
          });
          
          const allSlots = allResponse?.items || [];
          const groupedAllSlots = groupSlots(allSlots);
          setAllSlotsList(groupedAllSlots);
          
          // Calculate pagination
          const total = groupedAllSlots.length;
          setTotalCount(total);
          setTotalPages(Math.ceil(total / pageSize));
          
          // Show first page
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          setSlotsList(groupedAllSlots.slice(startIndex, endIndex));
        }
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách lịch làm việc';
      setError(errorMessage);
      showGlobalError(errorMessage);
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    
    if (hasApiPagination) {
      // API pagination - fetch new page
      fetchSlots(value);
    } else {
      // FE pagination - slice from allSlotsList
      const startIndex = (value - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setSlotsList(allSlotsList.slice(startIndex, endIndex));
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchSlots(1);
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

  // Handle click on slot to view students
  const handleSlotClick = async (slot) => {
    setSelectedSlot(slot);
    await fetchStudentsForSlot(slot.branchSlotId, slot.dateFull, slot.timeframe.id);
  };

  const fetchStudentsForSlot = async (branchSlotId, date, timeframeId) => {
    setLoadingStudents(true);
    setStudentsList([]);
    setStudentsDialogOpen(true);
    setCheckedStudents(new Set());
    setActivitiesByStudent({});

    try {
      const response = await studentSlotService.getStaffSlots({
              pageIndex: 1, 
        pageSize: 1000,
        branchSlotId: branchSlotId,
        date: date,
        upcomingOnly: false
      });

      const slots = response?.items || [];
      
      // Filter by timeframe if provided
      let filteredSlots = slots;
      if (timeframeId) {
        filteredSlots = slots.filter(slot => {
          const slotTimeframeId = slot.timeframe?.id || slot.timeframeId;
          return slotTimeframeId === timeframeId;
        });
      }
      
      // Filter only booked slots
      const bookedSlots = filteredSlots.filter(slot => 
        slot.status === 'Booked' || slot.status === 'booked'
      );

      setStudentsList(bookedSlots);
      setFilteredStudentsList(bookedSlots);
      
      // Automatically load activities for all students when dialog opens
      bookedSlots.forEach(slot => {
        if (slot.id) {
          loadActivitiesForStudent(slot.id);
        }
      });
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
    setFilteredStudentsList([]);
    setSearchTerm('');
    setCheckedStudents(new Set());
    setActivitiesByStudent({});
    setExpandedActivities(new Set());
  };

  // Filter students by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudentsList(studentsList);
    } else {
      const filtered = studentsList.filter(slot => {
        const studentName = (slot.studentName || '').toLowerCase();
        const parentName = (slot.parentName || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return studentName.includes(search) || parentName.includes(search);
      });
      setFilteredStudentsList(filtered);
    }
  }, [searchTerm, studentsList]);

  // Toggle expand/collapse activities
  const handleToggleActivities = (studentSlotId) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentSlotId)) {
        newSet.delete(studentSlotId);
      } else {
        newSet.add(studentSlotId);
        // Load activities when expanding
        if (studentSlotId && !activitiesByStudent[studentSlotId]) {
          loadActivitiesForStudent(studentSlotId);
        }
      }
      return newSet;
    });
  };

  // Load activities for a student
  const loadActivitiesForStudent = async (studentSlotId) => {
    // Allow reloading if needed (when creating/editing/deleting activities)
    // But skip if already loading
    if (loadingActivities[studentSlotId]) {
      return;
    }
    
    setLoadingActivities(prev => ({ ...prev, [studentSlotId]: true }));
    try {
      const response = await activityService.getActivitiesPaged({
        pageIndex: 1,
        pageSize: 100,
        StudentSlotId: studentSlotId
      });
      
      const activities = Array.isArray(response?.items) ? response.items : [];
      setActivitiesByStudent(prev => ({
        ...prev,
        [studentSlotId]: activities
      }));
    } catch (err) {
      console.error('Error loading activities:', err);
      // Set empty array on error so UI doesn't show loading forever
      setActivitiesByStudent(prev => ({
        ...prev,
        [studentSlotId]: []
      }));
    } finally {
      setLoadingActivities(prev => ({ ...prev, [studentSlotId]: false }));
    }
  };

  // Check-in handler
  const handleCheckinToggle = async (slot, checked) => {
    if (!slot.studentId) {
      toast.error('Không tìm thấy ID học sinh', {
        position: 'top-right',
        autoClose: 4000
      });
      return;
    }

    if (checked) {
      setCheckingIn(prev => new Set(prev).add(slot.studentId));
      try {
        await activityService.checkinStaff(slot.studentId);
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
      setCheckedStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(slot.studentId);
        return newSet;
      });
    }
  };

  // Activity handlers
  const handleCreateActivity = (slot) => {
    setSelectedStudentSlot(slot);
    setActivityForm({
      activityTypeId: '',
      note: '',
      imageFile: null
    });
    setActivityDialogOpen(true);
  };

  const handleViewActivity = async (activity) => {
    try {
      const fullActivity = await activityService.getActivityById(activity.id);
      setSelectedActivity(fullActivity);
      setActivityDetailDialogOpen(true);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải chi tiết hoạt động';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
    }
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setActivityForm({
      activityTypeId: activity.activityTypeId || '',
      note: activity.note || '',
      imageFile: null
    });
    setActivityEditDialogOpen(true);
  };

  const handleDeleteActivity = (activity) => {
    setSelectedActivity(activity);
    setActivityDeleteDialogOpen(true);
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

  const handleCloseActivityDetailDialog = () => {
    setActivityDetailDialogOpen(false);
    setSelectedActivity(null);
  };

  const handleCloseActivityEditDialog = () => {
    setActivityEditDialogOpen(false);
    setSelectedActivity(null);
    setActivityForm({
      activityTypeId: '',
      note: '',
      imageFile: null
    });
  };

  const handleCloseActivityDeleteDialog = () => {
    setActivityDeleteDialogOpen(false);
    setSelectedActivity(null);
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
      
      // Reload activities for this student
      if (selectedStudentSlot.id) {
        setActivitiesByStudent(prev => {
          const newState = { ...prev };
          delete newState[selectedStudentSlot.id];
          return newState;
        });
        await loadActivitiesForStudent(selectedStudentSlot.id);
      }
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

  const handleSubmitEditActivity = async () => {
    if (!selectedActivity) return;

    if (!activityForm.activityTypeId) {
      toast.error('Vui lòng chọn loại hoạt động', {
        position: 'top-right',
        autoClose: 4000
      });
      return;
    }

    setSubmittingActivity(true);
    try {
      let imageUrl = selectedActivity.imageUrl || '';

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

      await activityService.updateActivity(selectedActivity.id, {
        activityTypeId: activityForm.activityTypeId,
        note: activityForm.note || '',
        imageUrl: imageUrl
      });

      toast.success('Cập nhật hoạt động thành công!', {
        position: 'top-right',
        autoClose: 3000
      });

      handleCloseActivityEditDialog();
      
      // Reload activities
      if (selectedActivity.studentSlotId) {
        setActivitiesByStudent(prev => {
          const newState = { ...prev };
          delete newState[selectedActivity.studentSlotId];
          return newState;
        });
        await loadActivitiesForStudent(selectedActivity.studentSlotId);
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể cập nhật hoạt động';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
      console.error('Error updating activity:', err);
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleConfirmDeleteActivity = async () => {
    if (!selectedActivity) return;

    setDeletingActivity(true);
    try {
      await activityService.deleteActivity(selectedActivity.id);
      toast.success('Xóa hoạt động thành công!', {
        position: 'top-right',
        autoClose: 3000
      });
      handleCloseActivityDeleteDialog();
      
      // Reload activities
      if (selectedActivity.studentSlotId) {
        setActivitiesByStudent(prev => {
          const newState = { ...prev };
          delete newState[selectedActivity.studentSlotId];
          return newState;
        });
        await loadActivitiesForStudent(selectedActivity.studentSlotId);
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể xóa hoạt động';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
      console.error('Error deleting activity:', err);
    } finally {
      setDeletingActivity(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
          title="Quản lý Hoạt Động"
        />

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
        )}

        {/* Slots List */}
        {slotsList.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Chưa có lịch làm việc nào.
          </Alert>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              {slotsList.map((slot, index) => (
                <AnimatedCard key={`${slot.branchSlotId}_${slot.date}_${slot.timeframe.id}`} delay={index * 0.05}>
                  <Card 
                    sx={{
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 'var(--shadow-md)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => handleSlotClick(slot)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56
                          }}
                        >
                          <CalendarIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{
                              fontWeight: 600,
                              fontFamily: 'var(--font-family-heading)',
                              mb: 1
                            }}
                          >
                            {formatDateOnlyUTC7(slot.dateFull, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {slot.timeframeName} ({formatTime(slot.startTime)} - {formatTime(slot.endTime)})
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {slot.roomName}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${slot.studentCount} học sinh`}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '1rem',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-md)'
                      },
                      '& .Mui-selected': {
                        fontWeight: 600
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" align="center">
                    Hiển thị {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} trong tổng số {totalCount} lịch làm việc
                  </Typography>
                </Stack>
              </Box>
            )}
          </>
        )}

        {/* Dialog quản lý học sinh */}
        <Dialog 
          open={studentsDialogOpen} 
          onClose={handleCloseStudentsDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-xl)',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" component="div" sx={{ fontFamily: 'var(--font-family-heading)', fontWeight: 600 }}>
                  Quản lý học sinh
                            </Typography>
                {selectedSlot && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSlot.branchSlotName} • {selectedSlot.timeframeName} • {selectedSlot.roomName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateOnlyUTC7(selectedSlot.dateFull, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </Typography>
                  </Box>
                )}
              </Box>
              <IconButton onClick={handleCloseStudentsDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
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
              <>
                {/* Search Bar */}
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm học sinh hoặc phụ huynh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                {filteredStudentsList.length === 0 ? (
                  <Alert severity="info">
                    Không tìm thấy học sinh nào phù hợp với từ khóa "{searchTerm}".
                  </Alert>
                ) : (
                  <List sx={{ pt: 0 }}>
                    {filteredStudentsList.map((slot, index) => {
                  const studentSlotId = slot.id;
                  const activities = activitiesByStudent[studentSlotId] || [];
                  const isLoadingActivities = loadingActivities[studentSlotId];
                  
                  return (
                    <React.Fragment key={slot.id || index}>
                      <ListItem
                              sx={{ 
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          py: 2,
                          px: 2,
                          borderRadius: 1,
                                mb: 2,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        {/* Student Info */}
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {slot.studentName || 'Chưa có tên'}
                                  </Typography>
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

                        {/* Create Activity Button */}
                        <Button
                          variant="contained"
                          startIcon={<AddPhotoIcon />}
                          onClick={() => handleCreateActivity(slot)}
                          size="small"
                          sx={{ mb: 2 }}
                        >
                          Tạo hoạt động
                        </Button>

                        {/* Activities Section with Expand/Collapse */}
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <Card
                            onClick={() => handleToggleActivities(studentSlotId)}
                                sx={{ 
                              cursor: 'pointer',
                              borderRadius: 'var(--radius-lg)',
                              border: '1px solid',
                              borderColor: expandedActivities.has(studentSlotId) ? 'primary.main' : 'divider',
                              backgroundColor: expandedActivities.has(studentSlotId) ? 'primary.50' : 'background.paper',
                              boxShadow: expandedActivities.has(studentSlotId) ? 'var(--shadow-sm)' : 'none',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'primary.50',
                                boxShadow: 'var(--shadow-sm)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 'var(--radius-md)',
                                      backgroundColor: expandedActivities.has(studentSlotId) ? 'primary.main' : 'action.hover',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <EventIcon
                                      sx={{
                                        color: expandedActivities.has(studentSlotId) ? 'white' : 'primary.main',
                                        fontSize: 20
                                      }}
                                    />
                                  </Box>
                                  <Box>
                              <Typography 
                                      variant="subtitle1"
                                      sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        fontFamily: 'var(--font-family-heading)'
                                      }}
                                    >
                                      Hoạt động
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                      sx={{ display: 'block', mt: 0.25 }}
                                    >
                                      {isLoadingActivities
                                        ? 'Đang tải...'
                                        : activities.length === 0
                                        ? 'Chưa có hoạt động'
                                        : `${activities.length} hoạt động đã tạo`}
                              </Typography>
                            </Box>
                                </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {isLoadingActivities ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <Chip
                                      label={activities.length}
                                      size="small"
                                      color="primary"
                                      sx={{
                                        minWidth: 36,
                                        height: 24,
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                      }}
                                    />
                                  )}
                                  <IconButton
                                    size="small"
                                    sx={{
                                      color: 'primary.main',
                                      transition: 'transform 0.2s ease',
                                      transform: expandedActivities.has(studentSlotId) ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                  >
                                    <ExpandMoreIcon />
                                  </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                          </Card>
                          
                          <Collapse in={expandedActivities.has(studentSlotId)}>
                            {isLoadingActivities ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={24} />
                              </Box>
                            ) : activities.length === 0 ? (
                              <Alert severity="info" sx={{ mt: 1 }}>
                                Chưa có hoạt động nào.
                              </Alert>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                {activities.map((activity) => (
                                  <Card
                                    key={activity.id}
                                    sx={{
                                      borderRadius: 'var(--radius-lg)',
                                      border: '1px solid var(--border-light)',
                                      backgroundColor: 'var(--bg-secondary)'
                                    }}
                                  >
                                    <CardContent sx={{ p: 2 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Chip
                                          label={activity.activityType?.name || 'Chưa xác định'}
                                          color="primary"
                                          size="small"
                                          sx={{ fontWeight: 600 }}
                                        />
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                          <Tooltip title="Xem chi tiết">
                                            <IconButton
                                              size="small"
                                              onClick={() => handleViewActivity(activity)}
                                              sx={{ color: 'primary.main' }}
                                            >
                                              <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                            <Tooltip title="Sửa">
                              <IconButton
                                size="small"
                                              onClick={() => handleEditActivity(activity)}
                                sx={{ color: 'warning.main' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                              onClick={() => handleDeleteActivity(activity)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                                      </Box>
                                      {activity.imageUrl && (
                                        <Box
                                          sx={{
                                            width: '100%',
                                            height: 100,
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            mb: 1,
                                            backgroundColor: 'grey.100'
                                          }}
                                        >
                                          <img
                                            src={activity.imageUrl}
                                            alt={activity.activityType?.name || 'Hoạt động'}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover'
                                            }}
                  />
                </Box>
              )}
                                      {activity.note && (
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          {activity.note}
                </Typography>
                                      )}
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDateTimeUTC7(activity.createdTime || activity.createdDate)}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                ))}
              </Box>
                            )}
                          </Collapse>
                        </Box>
                      </ListItem>
                      {index < studentsList.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
                  </List>
                )}
            </>
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
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-xl)'
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" component="div" sx={{ fontFamily: 'var(--font-family-heading)', fontWeight: 600 }}>
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

        {/* Dialog xem chi tiết hoạt động */}
      <Dialog 
          open={activityDetailDialogOpen} 
          onClose={handleCloseActivityDetailDialog}
        maxWidth="md"
        fullWidth
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-xl)'
            }
          }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontFamily: 'var(--font-family-heading)', fontWeight: 600 }}>
              Chi tiết Hoạt Động
            </Typography>
              <IconButton onClick={handleCloseActivityDetailDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
            {selectedActivity && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                {selectedActivity.imageUrl && (
                  <Box
                    sx={{
                      width: '100%',
                      maxHeight: 400,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <img
                      src={selectedActivity.imageUrl}
                      alt={selectedActivity.activityType?.name || 'Hoạt động'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        maxHeight: 400,
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                )}

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Loại hoạt động
                  </Typography>
                  <Chip
                    label={selectedActivity.activityType?.name || 'Chưa xác định'}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                  {selectedActivity.activityType?.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      {selectedActivity.activityType.description}
                    </Typography>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ghi chú
                  </Typography>
                  <Typography variant="body1">
                    {selectedActivity.note || 'Không có ghi chú'}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Thời gian tạo
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTimeUTC7(selectedActivity.createdTime || selectedActivity.createdDate)}
                  </Typography>
                </Box>
                </Box>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseActivityDetailDialog} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

        {/* Dialog sửa hoạt động */}
      <Dialog 
          open={activityEditDialogOpen} 
          onClose={handleCloseActivityEditDialog}
        maxWidth="sm"
        fullWidth
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-xl)'
            }
          }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontFamily: 'var(--font-family-heading)', fontWeight: 600 }}>
                Sửa hoạt động
            </Typography>
              <IconButton onClick={handleCloseActivityEditDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
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

            <ImageUpload
              label="Ảnh hoạt động"
              helperText="Chọn ảnh mới để thay thế (để trống nếu giữ nguyên ảnh cũ)"
                value={activityForm.imageFile}
                onChange={(file) => setActivityForm({ ...activityForm, imageFile: file })}
                disabled={submittingActivity}
              required={false}
            />

              {selectedActivity?.imageUrl && !activityForm.imageFile && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ảnh hiện tại:
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <img
                    src={selectedActivity.imageUrl}
                    alt="Current"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      maxHeight: 200,
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
              onClick={handleCloseActivityEditDialog} 
              disabled={submittingActivity}
          >
            Hủy
          </Button>
          <Button 
              onClick={handleSubmitEditActivity} 
            variant="contained"
              disabled={submittingActivity || !activityForm.activityTypeId}
          >
              {submittingActivity ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

        {/* Dialog xác nhận xóa hoạt động */}
      <ConfirmDialog
          open={activityDeleteDialogOpen}
          onClose={handleCloseActivityDeleteDialog}
          onConfirm={handleConfirmDeleteActivity}
        title="Xác nhận xóa hoạt động"
          description="Bạn có chắc chắn muốn xóa hoạt động này? Hành động này không thể hoàn tác."
          confirmText={deletingActivity ? 'Đang xóa...' : 'Xóa'}
        cancelText="Hủy"
        confirmColor="error"
        highlightText={selectedActivity?.activityType?.name}
      />
      </Box>
    </PageWrapper>
  );
};

export default StaffActivities;
