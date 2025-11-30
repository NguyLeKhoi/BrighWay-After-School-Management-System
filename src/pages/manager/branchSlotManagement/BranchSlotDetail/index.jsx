import React, { useState, useEffect, useMemo } from 'react';
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
  Person
} from '@mui/icons-material';
import ContentLoading from '../../../../components/Common/ContentLoading';
import branchSlotService from '../../../../services/branchSlot.service';

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

  useEffect(() => {
    const loadData = async () => {
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
    };

    loadData();
  }, [id]);

  const handleBack = () => {
    navigate('/manager/branch-slots');
  };

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
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Rooms and Staff Combined Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MeetingRoom sx={{ fontSize: 24, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Phòng và Nhân Viên ({rooms.length} phòng, {roomsWithStaff.reduce((total, item) => total + (item.staff?.length || 0), 0)} nhân viên)
                </Typography>
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
                                      </Box>
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Không có
                                  </Typography>
                                )}
                              </TableCell>
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
                                    </Box>
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                  Chưa có nhân viên được phân công
                                </Typography>
                              )}
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
    </Box>
  );
};

export default BranchSlotDetail;

