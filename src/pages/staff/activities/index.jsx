import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Paper,
  Grid,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Pagination,
  Stack
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import activityService from '../../../services/activity.service';
import activityTypeService from '../../../services/activityType.service';
import studentSlotService from '../../../services/studentSlot.service';
import imageService from '../../../services/image.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ImageUpload from '../../../components/Common/ImageUpload';
import { toast } from 'react-toastify';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './activities.module.css';

const StaffActivities = () => {
  // Activities data
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 12,
    totalPages: 1,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Filters
  const [filters, setFilters] = useState({
    StudentSlotId: '',
    ActivityTypeId: '',
    CreatedById: '',
    FromDate: '',
    ToDate: '',
    IsViewed: '',
    Keyword: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Student slots for filter dropdown
  const [studentSlots, setStudentSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotInfoMap, setSlotInfoMap] = useState({}); // Map studentSlotId to slot info

  const { isLoading, showLoading, hideLoading } = useLoading();
  const [error, setError] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loadingActivityTypes, setLoadingActivityTypes] = useState(false);
  const [editForm, setEditForm] = useState({
    activityTypeId: '',
    note: '',
    imageFile: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { showGlobalError } = useApp();
  const { user } = useAuth();

  // Load student slots for filter
  const loadStudentSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const response = await studentSlotService.getStaffSlots({
        pageIndex: 1,
        pageSize: 100
      });
      const slots = Array.isArray(response?.items) ? response.items : [];
      setStudentSlots(slots);

      // Build slot info map
      const map = {};
      slots.forEach(slot => {
        if (slot.id) {
          map[slot.id] = {
            studentName: slot.studentName || slot.student?.name || 'Không tên',
            date: slot.date,
            status: slot.status,
            branchSlotName: slot.branchSlot?.name || ''
          };
        }
      });
      setSlotInfoMap(map);
    } catch (err) {
      console.error('Error loading student slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Load activities with pagination and filters
  const loadActivities = useCallback(async (pageIndex = 1) => {
    setError(null);
    showLoading();
    try {
      const params = {
        pageIndex,
        pageSize: pagination.pageSize,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
        )
      };

      const response = await activityService.getActivitiesPaged(params);
      
      const items = Array.isArray(response?.items) ? response.items : [];
      setActivities(items);
      
      setPagination(prev => ({
        ...prev,
        pageIndex: response.pageIndex || pageIndex,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0,
        hasPreviousPage: response.hasPreviousPage || false,
        hasNextPage: response.hasNextPage || false
      }));

      // Load slot info for activities
      const slotIds = items
        .map(a => a.studentSlotId)
        .filter(id => id && !slotInfoMap[id]);
      
      if (slotIds.length > 0) {
        try {
          const slotPromises = slotIds.map(slotId => 
            studentSlotService.getStudentSlots({ 
              pageIndex: 1, 
              pageSize: 1,
              id: slotId 
            }).catch(() => null)
          );
          const slotResponses = await Promise.all(slotPromises);
          
          const newMap = { ...slotInfoMap };
          slotResponses.forEach((response, index) => {
            if (response?.items?.[0]) {
              const slot = response.items[0];
              newMap[slotIds[index]] = {
                studentName: slot.studentName || slot.student?.name || 'Không tên',
                date: slot.date,
                status: slot.status,
                branchSlotName: slot.branchSlot?.name || ''
              };
            }
          });
          setSlotInfoMap(newMap);
        } catch (err) {
          console.error('Error loading slot details:', err);
        }
      }
    } catch (e) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Không tải được danh sách hoạt động';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      hideLoading();
    }
  }, [filters, pagination.pageSize, slotInfoMap, showLoading, showGlobalError]);

  const loadActivityTypes = async () => {
    try {
      setLoadingActivityTypes(true);
      const data = await activityTypeService.getAllActivityTypes();
      setActivityTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching activity types:', err);
    } finally {
      setLoadingActivityTypes(false);
    }
  };

  useEffect(() => {
    loadActivities(pagination.pageIndex);
    loadActivityTypes();
    loadStudentSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadActivities(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handlePageChange = (event, value) => {
    loadActivities(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      StudentSlotId: '',
      ActivityTypeId: '',
      CreatedById: '',
      FromDate: '',
      ToDate: '',
      IsViewed: '',
      Keyword: ''
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Chưa xác định';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Chưa xác định';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // View Detail
  const handleViewDetail = async (activity) => {
    try {
      // Fetch full details
      const fullActivity = await activityService.getActivityById(activity.id);
      setSelectedActivity(fullActivity);
      setDetailDialogOpen(true);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải chi tiết hoạt động';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedActivity(null);
  };

  // Edit Activity
  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setEditForm({
      activityTypeId: activity.activityTypeId || '',
      note: activity.note || '',
      imageFile: null
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedActivity(null);
    setEditForm({
      activityTypeId: '',
      note: '',
      imageFile: null
    });
  };

  const handleSubmitEdit = async () => {
    if (!selectedActivity) return;

    if (!editForm.activityTypeId) {
      toast.error('Vui lòng chọn loại hoạt động', {
        position: 'top-right',
        autoClose: 4000
      });
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = selectedActivity.imageUrl || '';

      // Upload new image if exists
      if (editForm.imageFile) {
        try {
          imageUrl = await imageService.uploadImage(editForm.imageFile);
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

      // Update activity
      await activityService.updateActivity(selectedActivity.id, {
        activityTypeId: editForm.activityTypeId,
        note: editForm.note || '',
        imageUrl: imageUrl
      });

      toast.success('Cập nhật hoạt động thành công!', {
        position: 'top-right',
        autoClose: 3000
      });

      handleCloseEditDialog();
      await loadActivities(pagination.pageIndex);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể cập nhật hoạt động';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Activity
  const handleDelete = (activity) => {
    setSelectedActivity(activity);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedActivity(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedActivity) return;

    setDeleting(true);
    try {
      await activityService.deleteActivity(selectedActivity.id);
      toast.success('Xóa hoạt động thành công!', {
        position: 'top-right',
        autoClose: 3000
      });
      handleCloseDeleteDialog();
      await loadActivities(pagination.pageIndex);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể xóa hoạt động';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
    } finally {
      setDeleting(false);
    }
  };

  const slotInfo = (activity) => {
    if (!activity.studentSlotId) return null;
    return slotInfoMap[activity.studentSlotId] || null;
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className={styles.activitiesPage}>
        <div className={styles.container}>
          {/* Header with Filters */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Hoạt Động
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Bộ lọc
              </Button>
            </Box>
          </Box>

          {/* Filters Panel */}
          {showFilters && (
            <Paper sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Tìm kiếm"
                    placeholder="Nhập từ khóa..."
                    value={filters.Keyword}
                    onChange={(e) => handleFilterChange('Keyword', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Loại hoạt động</InputLabel>
                    <Select
                      value={filters.ActivityTypeId}
                      onChange={(e) => handleFilterChange('ActivityTypeId', e.target.value)}
                      label="Loại hoạt động"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {activityTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Slot học</InputLabel>
                    <Select
                      value={filters.StudentSlotId}
                      onChange={(e) => handleFilterChange('StudentSlotId', e.target.value)}
                      label="Slot học"
                      disabled={loadingSlots}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {studentSlots.map((slot) => (
                        <MenuItem key={slot.id} value={slot.id}>
                          {slot.studentName || slot.student?.name || 'Không tên'} - {formatDate(slot.date)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái xem</InputLabel>
                    <Select
                      value={filters.IsViewed}
                      onChange={(e) => handleFilterChange('IsViewed', e.target.value)}
                      label="Trạng thái xem"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="true">Đã xem</MenuItem>
                      <MenuItem value="false">Chưa xem</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Từ ngày"
                    type="date"
                    value={filters.FromDate}
                    onChange={(e) => handleFilterChange('FromDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Đến ngày"
                    type="date"
                    value={filters.ToDate}
                    onChange={(e) => handleFilterChange('ToDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={clearFilters} size="small">
                    Xóa bộ lọc
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Activities Grid */}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : activities.length === 0 && !isLoading ? (
            <Alert severity="info">
              Chưa có hoạt động nào được tạo.
            </Alert>
          ) : (
            <>
              <Grid container spacing={3}>
                {activities.map((activity) => {
                  const slot = slotInfo(activity);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={activity.id}>
                      <Card 
                        onClick={() => handleViewDetail(activity)}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 'var(--radius-xl)',
                          border: '1px solid var(--border-light)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 'var(--shadow-lg)',
                            borderColor: 'var(--color-primary)'
                          }
                        }}
                      >
                        {/* Image */}
                        {activity.imageUrl ? (
                          <Box
                            sx={{
                              width: '100%',
                              height: 250,
                              overflow: 'hidden',
                              backgroundColor: 'grey.50',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative'
                            }}
                          >
                            <img
                              src={activity.imageUrl}
                              alt={activity.activityType?.name || 'Hoạt động'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              height: 250,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'grey.100',
                              color: 'grey.400'
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 48 }} />
                          </Box>
                        )}

                        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                          {/* Activity Type */}
                          <Box sx={{ mb: 1.5 }}>
                            <Chip
                              label={activity.activityType?.name || 'Chưa xác định'}
                              color="primary"
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>

                          {/* Student Slot Info */}
                          {slot && (
                            <Box sx={{ mb: 1.5, p: 1, backgroundColor: 'primary.50', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <SchoolIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                  {slot.studentName}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(slot.date)}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Note */}
                          {activity.note && (
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                mb: 2,
                                minHeight: 48,
                                color: 'text.primary',
                                fontWeight: 500,
                                fontFamily: 'var(--font-family)'
                              }}
                            >
                              {activity.note}
                            </Typography>
                          )}

                          {/* Description */}
                          {activity.activityType?.description && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                mb: 2,
                                fontFamily: 'var(--font-family)',
                                fontStyle: 'italic'
                              }}
                            >
                              {activity.activityType.description}
                            </Typography>
                          )}

                          {/* Info */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {/* Staff */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  fontSize: '0.75rem',
                                  bgcolor: 'primary.main'
                                }}
                              >
                                {getInitials(activity.staffName)}
                              </Avatar>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontFamily: 'var(--font-family)' }}
                              >
                                {activity.staffName || 'Chưa xác định'}
                              </Typography>
                            </Box>

                            {/* Created Time */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ fontFamily: 'var(--font-family)' }}
                              >
                                {formatDateTime(activity.createdTime || activity.createdDate)}
                              </Typography>
                            </Box>

                            {/* Viewed Status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {activity.isViewed ? (
                                <VisibilityIcon sx={{ fontSize: 16, color: 'success.main' }} />
                              ) : (
                                <VisibilityOffIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              )}
                              <Typography 
                                variant="caption" 
                                color={activity.isViewed ? 'success.main' : 'text.secondary'}
                                sx={{ fontFamily: 'var(--font-family)' }}
                              >
                                {activity.isViewed ? 'Đã xem' : 'Chưa xem'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>

                        {/* Actions */}
                        <CardActions 
                          sx={{ p: 1.5, pt: 0, justifyContent: 'flex-end', alignItems: 'center' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Sửa">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(activity);
                                }}
                                sx={{ color: 'warning.main' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(activity);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.pageIndex}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}

              {/* Pagination Info */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {activities.length} / {pagination.totalCount} hoạt động
                </Typography>
              </Box>
            </>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              Chi tiết Hoạt Động
            </Typography>
            <IconButton onClick={handleCloseDetailDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedActivity && (() => {
            const slot = slotInfo(selectedActivity);
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Image */}
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

                {/* Student Slot Info */}
                {slot && (
                  <>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Thông tin Slot
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: 'primary.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <SchoolIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Học sinh: {slot.studentName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Ngày: {formatDate(slot.date)} - {formatDateTime(slot.date)}
                          </Typography>
                        </Box>
                        {slot.branchSlotName && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Slot: {slot.branchSlotName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Divider />
                  </>
                )}

                {/* Activity Type */}
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

                {/* Note */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ghi chú
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'var(--font-family)' }}>
                    {selectedActivity.note || 'Không có ghi chú'}
                  </Typography>
                </Box>

                <Divider />

                {/* Staff Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nhân viên tạo
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'primary.main' }}>
                      {getInitials(selectedActivity.staffName)}
                    </Avatar>
                    <Typography variant="body1" sx={{ fontFamily: 'var(--font-family)' }}>
                      {selectedActivity.staffName || 'Chưa xác định'}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Time Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Thời gian tạo
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'var(--font-family)' }}>
                    {formatDateTime(selectedActivity.createdTime || selectedActivity.createdDate)}
                  </Typography>
                </Box>

                <Divider />

                {/* Viewed Status */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Trạng thái
                  </Typography>
                  <Chip
                    icon={selectedActivity.isViewed ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    label={selectedActivity.isViewed ? 'Đã xem' : 'Chưa xem'}
                    color={selectedActivity.isViewed ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              Sửa Hoạt Động
            </Typography>
            <IconButton onClick={handleCloseEditDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Activity Type Selection */}
            <FormControl fullWidth required>
              <InputLabel>Loại hoạt động</InputLabel>
              <Select
                value={editForm.activityTypeId}
                onChange={(e) => setEditForm({ ...editForm, activityTypeId: e.target.value })}
                label="Loại hoạt động"
                disabled={loadingActivityTypes || submitting}
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
              value={editForm.note}
              onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
              disabled={submitting}
              fullWidth
            />

            {/* Image Upload */}
            <ImageUpload
              label="Ảnh hoạt động"
              helperText="Chọn ảnh mới để thay thế (để trống nếu giữ nguyên ảnh cũ)"
              value={editForm.imageFile}
              onChange={(file) => setEditForm({ ...editForm, imageFile: file })}
              disabled={submitting}
              required={false}
            />

            {/* Current Image Preview */}
            {selectedActivity?.imageUrl && !editForm.imageFile && (
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
            onClick={handleCloseEditDialog} 
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmitEdit} 
            variant="contained"
            disabled={submitting || !editForm.activityTypeId}
          >
            {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa hoạt động"
        description={`Bạn có chắc chắn muốn xóa hoạt động này? Hành động này không thể hoàn tác.`}
        confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
        cancelText="Hủy"
        confirmColor="error"
        highlightText={selectedActivity?.activityType?.name}
      />
    </>
  );
};

export default StaffActivities;
