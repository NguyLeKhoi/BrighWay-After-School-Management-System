import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Alert,
  Typography,
  Button,
  Divider,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  ArrowBack,
  AccessTime,
  Business,
  CalendarToday,
  MeetingRoom,
  Person,
  School,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { PersonAdd as AssignStaffIcon, MeetingRoomOutlined as AssignRoomIcon } from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import ConfirmDialog from '../../../../components/Common/ConfirmDialog';
import ManagementFormDialog from '../../../../components/Management/FormDialog';
import Form from '../../../../components/Common/Form';
import branchSlotService from '../../../../services/branchSlot.service';
import useBranchSlotDependencies from '../../../../hooks/useBranchSlotDependencies';
import { assignStaffSchema } from '../../../../utils/validationSchemas/assignStaffSchemas';
import { assignRoomsSchema } from '../../../../utils/validationSchemas/assignRoomsSchemas';
import { toast } from 'react-toastify';
import { formatDateOnlyUTC7 } from '../../../../utils/dateHelper';

const WEEK_DAYS = [
  { value: 0, label: 'Chủ Nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' }
];

const statusLabels = {
  'Available': 'Có sẵn',
  'Occupied': 'Đã đầy',
  'Cancelled': 'Đã hủy',
  'Maintenance': 'Bảo trì'
};

const statusColors = {
  'Available': 'success',
  'Occupied': 'warning',
  'Cancelled': 'error',
  'Maintenance': 'default'
};

const BranchSlotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [branchSlot, setBranchSlot] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unassigning, setUnassigning] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null, // 'staff' or 'room'
    item: null,
    onConfirm: null
  });

  // Dependencies for assign dialogs
  const {
    roomOptions,
    staffOptions,
    loading: dependenciesLoading,
    error: dependenciesError,
    fetchDependencies
  } = useBranchSlotDependencies();

  // Assign staff dialog state
  const [assignStaffDialog, setAssignStaffDialog] = useState({
    open: false,
    rooms: [],
    staffByRoom: null,
    selectedRoomId: '',
    roomsWithStaff: null,
    allAssignedStaffIds: null
  });
  const [assignStaffLoading, setAssignStaffLoading] = useState(false);
  const [slotRooms, setSlotRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Assign rooms dialog state
  const [assignRoomsDialog, setAssignRoomsDialog] = useState({
    open: false
  });
  const [assignRoomsLoading, setAssignRoomsLoading] = useState(false);
  const [assignedRooms, setAssignedRooms] = useState([]);
  const [loadingAssignedRooms, setLoadingAssignedRooms] = useState(false);


  const loadData = useCallback(async () => {
    if (!id) {
      setError('Thiếu thông tin cần thiết');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load branch slot details - this includes rooms and staff in rooms
      const slotData = await branchSlotService.getBranchSlotById(id);
      setBranchSlot(slotData);

      // Extract rooms from branch slot response
      // Rooms already contain staff information inside each room object
      const roomsData = slotData?.rooms || [];
      setRooms(roomsData);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin ca giữ trẻ';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [id, loadData]);

  const handleBack = () => {
    navigate('/manager/branch-slots');
  };

  const handleUnassignStaff = (staff) => {
    const staffId = staff.staffId || staff.userId || staff.id;
    const staffName = staff.staffName || staff.fullName || 'Nhân viên';
    
    setConfirmDialog({
      open: true,
      type: 'staff',
      item: { id: staffId, name: staffName },
      onConfirm: async () => {
        setUnassigning(true);
        try {
          await branchSlotService.unassignStaff(id, staffId);
          toast.success(`Đã gỡ nhân viên "${staffName}" khỏi ca giữ trẻ!`, {
            position: "top-right",
            autoClose: 3000,
          });
          // Reload data
          await loadData();
        } catch (err) {
          const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi gỡ nhân viên';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 4000,
          });
        } finally {
          setUnassigning(false);
          setConfirmDialog({ open: false, type: null, item: null, onConfirm: null });
        }
      }
    });
  };

  const handleUnassignRoom = (room) => {
    const roomId = room.id || room.roomId;
    const roomName = room.roomName || room.name || 'Phòng';
    
    setConfirmDialog({
      open: true,
      type: 'room',
      item: { id: roomId, name: roomName },
      onConfirm: async () => {
        setUnassigning(true);
        try {
          await branchSlotService.unassignRoom(id, roomId);
          toast.success(`Đã gỡ phòng "${roomName}" khỏi ca giữ trẻ!`, {
            position: "top-right",
            autoClose: 3000,
          });
          // Reload data
          await loadData();
        } catch (err) {
          const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi gỡ phòng';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 4000,
          });
        } finally {
          setUnassigning(false);
          setConfirmDialog({ open: false, type: null, item: null, onConfirm: null });
        }
      }
    });
  };

  // Fetch dependencies when assign dialogs open
  useEffect(() => {
    if (assignStaffDialog.open || assignRoomsDialog.open) {
      if (staffOptions.length === 0 || roomOptions.length === 0) {
        fetchDependencies();
      }
    }
  }, [assignStaffDialog.open, assignRoomsDialog.open, staffOptions.length, roomOptions.length, fetchDependencies]);

  const handleAssignStaff = useCallback(async () => {
    if (!branchSlot || !id) return;
    
    setAssignStaffDialog({ open: true, rooms: [], staffByRoom: null, selectedRoomId: '', roomsWithStaff: null, allAssignedStaffIds: null });
    setSlotRooms([]);
    setLoadingRooms(true);
    
    try {
      // Use current branchSlot data (already loaded)
      const roomsData = branchSlot?.rooms || [];
      
      // Get all staff assignments (from rooms and from slot.staff)
      const allAssignedStaffIds = new Set();
      const roomsWithStaff = new Set();
      
      // Extract staff assigned to each room
      const staffByRoom = new Map();
      roomsData.forEach(room => {
        const roomId = room.id || room.roomId;
        if (roomId) {
          const staffList = [];
          if (room.staff) {
            if (Array.isArray(room.staff)) {
              staffList.push(...room.staff.map(s => s.staffId || s.userId || s.id));
            } else if (typeof room.staff === 'object') {
              const staffId = room.staff.staffId || room.staff.userId || room.staff.id;
              if (staffId) staffList.push(staffId);
            }
          }
          if (staffList.length > 0) {
            const roomIdStr = String(roomId);
            staffByRoom.set(roomIdStr, new Set(staffList.map(String)));
            roomsWithStaff.add(roomIdStr);
            staffList.forEach(id => allAssignedStaffIds.add(String(id)));
          }
        }
      });
      
      // Also get staff from branchSlot.staff (staff without room assignment)
      const slotStaffList = branchSlot?.staff || [];
      slotStaffList.forEach(staff => {
        const staffId = staff.staffId || staff.userId || staff.id;
        if (staffId) {
          allAssignedStaffIds.add(String(staffId));
        }
      });
      
      setSlotRooms(roomsData);
      setAssignStaffDialog(prev => ({ 
        ...prev, 
        rooms: roomsData,
        staffByRoom,
        roomsWithStaff,
        allAssignedStaffIds
      }));
    } catch (err) {
      console.error('Error loading staff assignment data:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, [branchSlot, id]);

  const handleAssignStaffSubmit = useCallback(async (data) => {
    if (!id) return;

    setAssignStaffLoading(true);
    try {
      const submitData = {
        branchSlotId: id,
        userId: data.userId,
        roomId: data.roomId || null,
        name: data.name || null
      };

      await branchSlotService.assignStaff(submitData);
      
      toast.success('Gán nhân viên thành công!', {
        position: "top-right",
        autoClose: 3000,
      });

      setAssignStaffDialog({ open: false, rooms: [], staffByRoom: null, selectedRoomId: '', roomsWithStaff: null, allAssignedStaffIds: null });
      await loadData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gán nhân viên';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setAssignStaffLoading(false);
    }
  }, [id, loadData]);

  const handleAssignRooms = useCallback(async () => {
    if (!branchSlot || !id) return;
    
    setAssignRoomsDialog({ open: true });
    setAssignedRooms([]);
    setLoadingAssignedRooms(true);
    
    try {
      // Use current rooms data (already loaded)
      const roomsData = branchSlot?.rooms || [];
      setAssignedRooms(roomsData.map(room => room.id || room.roomId).filter(Boolean));
    } catch (err) {
      console.error('Error loading assigned rooms:', err);
      setAssignedRooms([]);
    } finally {
      setLoadingAssignedRooms(false);
    }
  }, [branchSlot, id]);

  const handleAssignRoomsSubmit = useCallback(async (data) => {
    if (!id) return;

    setAssignRoomsLoading(true);
    try {
      const submitData = {
        branchSlotId: id,
        roomIds: Array.isArray(data.roomIds) ? data.roomIds : []
      };

      await branchSlotService.assignRooms(submitData);
      
      toast.success('Gán phòng thành công!', {
        position: "top-right",
        autoClose: 3000,
      });

      setAssignRoomsDialog({ open: false });
      setAssignedRooms([]);
      await loadData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gán phòng';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setAssignRoomsLoading(false);
    }
  }, [id, loadData]);

  // Form fields and options for assign dialogs
  const staffSelectOptions = useMemo(
    () => {
      const options = [{ value: '', label: 'Chọn nhân viên' }];
      
      // Get all staff IDs that are already assigned
      const allAssignedStaffIds = assignStaffDialog.allAssignedStaffIds || new Set();
      
      // Filter out all staff that are already assigned
      const availableStaff = staffOptions.filter(staff => {
        return !allAssignedStaffIds.has(String(staff.id));
      });
      
      options.push(...availableStaff.map((staff) => ({
        value: staff.id,
        label: `${staff.name}${staff.email ? ` (${staff.email})` : ''}`
      })));
      
      return options;
    },
    [staffOptions, assignStaffDialog.allAssignedStaffIds]
  );

  const roomSelectOptions = useMemo(
    () => {
      const options = [{ value: '', label: 'Không chọn phòng (tùy chọn)' }];
      const roomsWithStaff = assignStaffDialog.roomsWithStaff || new Set();
      if (slotRooms.length > 0) {
        const availableRooms = slotRooms.filter(room => {
          const roomId = room.id || room.roomId;
          if (!roomId) return false;
          const roomIdStr = String(roomId);
          return !roomsWithStaff.has(roomIdStr);
        });
        
        options.push(...availableRooms.map((room) => ({
          value: room.id || room.roomId,
          label: room.facilityName 
            ? `${room.roomName || room.name || 'N/A'} - ${room.facilityName}` 
            : room.roomName || room.name || 'N/A'
        })));
      }
      return options;
    },
    [slotRooms, assignStaffDialog.roomsWithStaff]
  );

  const assignRoomsSelectOptions = useMemo(
    () => {
      return roomOptions
        .filter((room) => room && room.id)
        .map((room) => ({
          value: room.id,
          label: room.facilityName 
            ? `${room.name || 'N/A'} - ${room.facilityName}` 
            : room.name || 'N/A'
        }));
    },
    [roomOptions]
  );

  const assignStaffFormFields = useMemo(
    () => [
      {
        section: 'Thông tin gán nhân viên',
        sectionDescription: 'Chọn nhân viên và phòng (nếu có) để gán vào ca giữ trẻ này.',
        name: 'roomId',
        label: 'Phòng (tùy chọn)',
        type: 'select',
        options: roomSelectOptions,
        gridSize: 12,
        disabled: assignStaffLoading || loadingRooms || roomSelectOptions.length === 0,
        helperText: slotRooms.length === 0 && !loadingRooms
          ? 'Ca giữ trẻ chưa có phòng nào được gán. Vui lòng gán phòng trước.'
          : assignStaffDialog.roomsWithStaff && assignStaffDialog.roomsWithStaff.size > 0
            ? 'Các phòng đã có nhân viên được gán sẽ không hiển thị. Chỉ hiển thị các phòng còn trống.'
            : 'Chọn phòng nếu nhân viên sẽ làm việc tại phòng cụ thể',
        onChange: (value) => {
          setAssignStaffDialog(prev => ({ ...prev, selectedRoomId: value || '' }));
        }
      },
      {
        name: 'userId',
        label: 'Nhân viên',
        type: 'select',
        required: true,
        options: staffSelectOptions,
        gridSize: 12,
        disabled: assignStaffLoading || dependenciesLoading || staffSelectOptions.length === 0,
        helperText: assignStaffDialog.allAssignedStaffIds && assignStaffDialog.allAssignedStaffIds.size > 0
          ? 'Các nhân viên đã được gán vào ca giữ trẻ này sẽ không hiển thị.'
          : undefined
      },
      {
        name: 'name',
        label: 'Tên vai trò (tùy chọn)',
        type: 'text',
        placeholder: 'Ví dụ: Nhân viên chăm sóc chính, Nhân viên hỗ trợ...',
        gridSize: 12,
        disabled: assignStaffLoading
      }
    ],
    [assignStaffLoading, dependenciesLoading, loadingRooms, staffSelectOptions, roomSelectOptions, slotRooms, assignStaffDialog.selectedRoomId, assignStaffDialog.roomsWithStaff, assignStaffDialog.allAssignedStaffIds]
  );

  const assignStaffDefaultValues = useMemo(
    () => ({
      userId: '',
      roomId: assignStaffDialog.selectedRoomId || '',
      name: ''
    }),
    [assignStaffDialog.selectedRoomId]
  );

  const assignRoomsFormFields = useMemo(
    () => [
      {
        section: 'Gán phòng cho ca giữ trẻ',
        sectionDescription: 'Chọn một hoặc nhiều phòng để gán vào ca giữ trẻ này.',
        name: 'roomIds',
        label: 'Phòng',
        type: 'multiselect',
        required: true,
        options: assignRoomsSelectOptions,
        gridSize: 12,
        disabled: assignRoomsLoading || dependenciesLoading || assignRoomsSelectOptions.length === 0,
        placeholder: 'Chọn phòng',
        helperText: 'Chọn ít nhất một phòng để gán vào ca giữ trẻ'
      }
    ],
    [assignRoomsLoading, dependenciesLoading, assignRoomsSelectOptions]
  );

  const assignRoomsDefaultValues = useMemo(
    () => ({
      roomIds: assignedRooms || []
    }),
    [assignedRooms]
  );

  // Calculate derived values safely (even if branchSlot is null)
  const weekDayLabel = branchSlot 
    ? (WEEK_DAYS.find(day => day.value === branchSlot.weekDate)?.label || `Ngày ${branchSlot.weekDate}`)
    : '';
  const status = branchSlot?.status || 'Available';
  const staffList = branchSlot?.staff || [];

  // Group staff by room - staff info is already in each room object
  const roomsWithStaff = useMemo(() => {
    if (!branchSlot || !rooms || rooms.length === 0) return [];
    
    // Map rooms to include staff from room.staff
    const roomsWithStaffList = rooms.map(room => {
      const roomId = room.roomId || room.id;
      
      // Extract staff from room object - can be object or array
      let staffArray = [];
      if (room.staff) {
        // If staff is an object, convert to array
        if (Array.isArray(room.staff)) {
          staffArray = room.staff;
        } else if (typeof room.staff === 'object') {
          // Single staff object - convert to array
          staffArray = [room.staff];
        }
      }
      
      return {
        room: {
          id: roomId,
          roomId: roomId,
          roomName: room.roomName || room.name,
          facilityName: room.facilityName,
          capacity: room.capacity,
          ...room
        },
        staff: staffArray
      };
    });
    
    // Also handle staff from staffList that are not in any room
    const staffInRooms = new Set();
    roomsWithStaffList.forEach(item => {
      item.staff.forEach(staff => {
        const staffId = staff.staffId || staff.id;
        if (staffId) {
          staffInRooms.add(String(staffId).trim());
        }
      });
    });
    
    // Find staff without room assignment
    const unassignedStaff = staffList.filter(staff => {
      const staffId = String(staff.staffId || staff.id || '').trim();
      const hasRoom = staff.roomId || staff.room?.id;
      return staffId && !hasRoom && !staffInRooms.has(staffId);
    });
    
    // Add unassigned staff if any
    if (unassignedStaff.length > 0) {
      roomsWithStaffList.push({
        room: null,
        staff: unassignedStaff
      });
    }
    
    // Sort rooms by name for consistency
    const assigned = roomsWithStaffList.filter(item => item.room);
    const unassigned = roomsWithStaffList.find(item => !item.room);
    
    assigned.sort((a, b) => {
      const nameA = (a.room.roomName || a.room.name || '').toLowerCase();
      const nameB = (b.room.roomName || b.room.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    // Build final result
    const finalResult = unassigned && unassigned.staff.length > 0 
      ? [...assigned, unassigned] 
      : assigned;
    
    return finalResult;
  }, [rooms, staffList, branchSlot]);

  if (loading) {
    return (
      <ContentLoading isLoading={true} text="Đang tải thông tin ca giữ trẻ..." />
    );
  }

  if (error || !branchSlot) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>
        <Alert severity="error">
          {error || 'Không tìm thấy thông tin ca giữ trẻ'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
              color: 'var(--text-primary)',
              flex: 1
            }}
          >
            Chi tiết Ca Giữ Trẻ
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Thông tin Cơ bản
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Business sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Chi Nhánh
                      </Typography>
                      <Typography variant="h6" fontWeight="medium">
                        {branchSlot.branch?.branchName || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Trạng Thái
                      </Typography>
                      <Chip
                        label={statusLabels[status] || status}
                        color={statusColors[status] || 'default'}
                        size="small"
                        sx={{ width: 'fit-content' }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <AccessTime sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Khung Giờ
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {branchSlot.timeframe?.name || 'N/A'}
                        {branchSlot.timeframe?.startTime && branchSlot.timeframe?.endTime && (
                          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                            ({branchSlot.timeframe.startTime} - {branchSlot.timeframe.endTime})
                          </Typography>
                        )}
                      </Typography>
                      {branchSlot.timeframe?.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {branchSlot.timeframe.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Loại Ca Giữ Trẻ
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {branchSlot.slotType?.name || 'N/A'}
                      </Typography>
                      {branchSlot.slotType?.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {branchSlot.slotType.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CalendarToday sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Ngày Trong Tuần
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {weekDayLabel}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {branchSlot.date && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <CalendarToday sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                          Ngày Cụ Thể
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDateOnlyUTC7(branchSlot.date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <School sx={{ color: 'var(--text-secondary)', fontSize: 24, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Cấp Độ Học Sinh
                      </Typography>
                      {(() => {
                        const explicitLevels = Array.isArray(branchSlot?.allowedStudentLevels)
                          ? branchSlot.allowedStudentLevels
                              .map(l => l?.name || l?.levelName || l)
                              .filter(Boolean)
                          : [];
                        const packageLevels = Array.isArray(branchSlot?.slotType?.assignedPackages)
                          ? branchSlot.slotType.assignedPackages
                              .map(p => p?.studentLevel?.name || p?.studentLevel?.levelName)
                              .filter(Boolean)
                          : [];
                        const levelNames = Array.from(new Set([...(explicitLevels || []), ...(packageLevels || [])]));
                        return levelNames.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {levelNames.map((name, idx) => (
                              <Chip key={`${name}-${idx}`} label={name} size="small" variant="outlined" />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">N/A</Typography>
                        );
                      })()}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Rooms and Staff Combined Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MeetingRoom sx={{ fontSize: 24, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Phòng và Nhân Viên ({rooms.length} phòng, {roomsWithStaff.reduce((total, item) => total + (item.staff?.length || 0), 0)} nhân viên)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AssignRoomIcon />}
                    onClick={handleAssignRooms}
                    disabled={loading || !branchSlot}
                    size="small"
                  >
                    Gán Phòng
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AssignStaffIcon />}
                    onClick={handleAssignStaff}
                    disabled={loading || !branchSlot}
                    size="small"
                  >
                    Gán Nhân Viên
                  </Button>
                </Box>
              </Box>
              {(rooms.length > 0 || roomsWithStaff.length > 0) ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Tên Phòng</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Cơ Sở</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sức Chứa</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Nhân Viên Được Phân Công</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 100 }}>Thao Tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomsWithStaff.map((item, index) => {
                        if (!item.room) {
                          // Staff without room
                          return (
                            <TableRow key="unassigned" hover>
                              <TableCell colSpan={3}>
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                  Chưa gán phòng
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {item.staff.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {item.staff.map((staff, idx) => (
                                      <Box 
                                        key={staff.staffId || staff.id || idx} 
                                        sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 1,
                                          p: 1,
                                          borderRadius: 1,
                                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                          '&:hover': {
                                            backgroundColor: 'rgba(255, 152, 0, 0.15)'
                                          }
                                        }}
                                      >
                                        <Person sx={{ fontSize: 18, color: 'warning.main' }} />
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="body2" fontWeight="medium">
                                            {staff.staffName || staff.fullName || 'N/A'}
                                          </Typography>
                                          {staff.staffRole || staff.roleName ? (
                                            <Chip
                                              label={staff.staffRole || staff.roleName}
                                              size="small"
                                              variant="outlined"
                                              sx={{ mt: 0.5, height: 22, fontSize: '0.75rem' }}
                                            />
                                          ) : null}
                                        </Box>
                                        <Tooltip title="Gỡ nhân viên">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleUnassignStaff(staff)}
                                            disabled={unassigning}
                                            sx={{ ml: 1 }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Không có
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          );
                        }
                        
                        return (
                          <TableRow key={item.room.id || item.room.roomId || index} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MeetingRoom sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" fontWeight="medium">
                                  {item.room.roomName || item.room.name || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {item.room.facilityName || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {item.room.capacity || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {item.staff.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {item.staff.map((staff, idx) => (
                                    <Box 
                                      key={staff.staffId || staff.id || idx} 
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0, 0, 0, 0.05)'
                                        }
                                      }}
                                    >
                                      <Person sx={{ fontSize: 18, color: 'primary.main' }} />
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight="medium">
                                          {staff.staffName || staff.fullName || 'N/A'}
                                        </Typography>
                                        {staff.staffRole || staff.roleName ? (
                                          <Chip
                                            label={staff.staffRole || staff.roleName}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mt: 0.5, height: 22, fontSize: '0.75rem' }}
                                          />
                                        ) : null}
                                      </Box>
                                      <Tooltip title="Gỡ nhân viên">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleUnassignStaff(staff)}
                                          disabled={unassigning}
                                          sx={{ ml: 1 }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                  Chưa có nhân viên được phân công
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Gỡ phòng">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleUnassignRoom(item.room)}
                                  disabled={unassigning}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  Chưa có phòng nào được gán
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assign Staff Dialog */}
      <ManagementFormDialog
        open={assignStaffDialog.open}
        onClose={() => setAssignStaffDialog({ open: false, rooms: [], staffByRoom: null, selectedRoomId: '', roomsWithStaff: null, allAssignedStaffIds: null })}
        mode="create"
        title="Gán Nhân Viên"
        icon={AssignStaffIcon}
        loading={assignStaffLoading || loadingRooms || dependenciesLoading}
        maxWidth="sm"
      >
        <Form
          key={`assign-staff-${id || 'new'}-${assignStaffDialog.selectedRoomId || 'no-room'}`}
          schema={assignStaffSchema}
          defaultValues={assignStaffDefaultValues}
          onSubmit={handleAssignStaffSubmit}
          submitText="Gán Nhân Viên"
          loading={assignStaffLoading || loadingRooms || dependenciesLoading}
          disabled={assignStaffLoading || loadingRooms || dependenciesLoading}
          fields={assignStaffFormFields}
        />
      </ManagementFormDialog>

      {/* Assign Rooms Dialog */}
      <ManagementFormDialog
        open={assignRoomsDialog.open}
        onClose={() => {
          setAssignRoomsDialog({ open: false });
          setAssignedRooms([]);
        }}
        mode="create"
        title="Gán Phòng"
        icon={AssignRoomIcon}
        loading={assignRoomsLoading || loadingAssignedRooms || dependenciesLoading}
        maxWidth="sm"
      >
        <Form
          key={`assign-rooms-${id || 'new'}`}
          schema={assignRoomsSchema}
          defaultValues={assignRoomsDefaultValues}
          onSubmit={handleAssignRoomsSubmit}
          submitText="Gán Phòng"
          loading={assignRoomsLoading || loadingAssignedRooms || dependenciesLoading}
          disabled={assignRoomsLoading || loadingAssignedRooms || dependenciesLoading}
          fields={assignRoomsFormFields}
        />
      </ManagementFormDialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: null, item: null, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.type === 'staff' ? 'Gỡ Nhân Viên' : 'Gỡ Phòng'}
        description={
          confirmDialog.type === 'staff'
            ? `Bạn có chắc chắn muốn gỡ nhân viên "${confirmDialog.item?.name}" khỏi ca giữ trẻ này?`
            : `Bạn có chắc chắn muốn gỡ phòng "${confirmDialog.item?.name}" khỏi ca giữ trẻ này? Tất cả nhân viên trong phòng này cũng sẽ bị gỡ.`
        }
        confirmText="Gỡ"
        cancelText="Hủy"
        confirmColor="error"
      />
    </Box>
  );
};

export default BranchSlotDetail;

