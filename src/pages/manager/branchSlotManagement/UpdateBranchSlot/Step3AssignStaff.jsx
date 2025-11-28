import React, { useMemo, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, FormHelperText } from '@mui/material';

const Step3AssignStaff = forwardRef(({ data, updateData, stepIndex, totalSteps, staffOptions = [], roomOptions = [], dependenciesLoading = false, branchSlotId }, ref) => {
  const [slotRooms, setSlotRooms] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(data.userId || '');
  const [selectedRoomId, setSelectedRoomId] = useState(data.roomId || '');
  const [roleName, setRoleName] = useState(data.name || '');

  // Update local state when data changes (from parent)
  useEffect(() => {
    if (data.userId !== undefined && data.userId !== null && data.userId !== '') {
      setSelectedUserId(data.userId);
    }
    if (data.roomId !== undefined && data.roomId !== null && data.roomId !== '') {
      setSelectedRoomId(data.roomId);
    }
    if (data.name !== undefined) {
      setRoleName(data.name || '');
    }
  }, [data.userId, data.roomId, data.name]);

  // Use rooms from step 2 or roomOptions
  useEffect(() => {
    if (data.roomIds && data.roomIds.length > 0) {
      const roomsFromStep2 = roomOptions.filter(r => data.roomIds.includes(r.id));
      setSlotRooms(roomsFromStep2);
    } else {
      setSlotRooms([]);
    }
  }, [data.roomIds, roomOptions]);

  const staffSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn nhân viên' },
      ...staffOptions.map((staff) => ({
        value: staff.id,
        label: `${staff.name}${staff.email ? ` (${staff.email})` : ''}`
      }))
    ],
    [staffOptions]
  );

  const roomSelectOptions = useMemo(() => {
    const options = [{ value: '', label: 'Không chọn phòng (tùy chọn)' }];
    
    if (slotRooms.length > 0) {
      options.push(...slotRooms.map((room) => ({
        value: room.id,
        label: room.name || 'N/A'
      })));
    } else if (roomOptions.length > 0) {
      options.push(...roomOptions.map((room) => ({
        value: room.id,
        label: room.name || 'N/A'
      })));
    }
    
    return options;
  }, [slotRooms, roomOptions]);

  const handleUserIdChange = (event) => {
    const value = event.target.value;
    setSelectedUserId(value);
    updateData({ userId: value });
  };

  const handleRoomIdChange = (event) => {
    const value = event.target.value;
    setSelectedRoomId(value);
    updateData({ roomId: value });
  };

  const handleRoleNameChange = (event) => {
    const value = event.target.value;
    setRoleName(value);
    updateData({ name: value });
  };

  // Expose submit function (always returns true as this step is optional)
  useImperativeHandle(ref, () => ({
    submit: async () => {
      return true;
    }
  }), []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 1.5, fontWeight: 600 }}>
        Bước {stepIndex + 1}/{totalSteps}: Gán nhân viên
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Chọn nhân viên để gán vào ca giữ trẻ này. Bạn có thể bỏ qua bước này và gán sau.
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }} disabled={dependenciesLoading || staffSelectOptions.length === 0}>
        <InputLabel id="staff-select-label">Nhân viên</InputLabel>
        <Select
          labelId="staff-select-label"
          id="staff-select"
          value={selectedUserId || ''}
          onChange={handleUserIdChange}
          label="Nhân viên"
          displayEmpty
        >
          {staffSelectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {selectedUserId ? `Đã chọn: ${staffSelectOptions.find(opt => opt.value === selectedUserId)?.label || 'N/A'}` : 'Chọn nhân viên để gán vào ca giữ trẻ (tùy chọn)'}
        </FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }} disabled={dependenciesLoading || roomSelectOptions.length === 0}>
        <InputLabel id="room-select-label">Phòng</InputLabel>
        <Select
          labelId="room-select-label"
          id="room-select"
          value={selectedRoomId || ''}
          onChange={handleRoomIdChange}
          label="Phòng"
          displayEmpty
        >
          {roomSelectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {selectedRoomId ? `Đã chọn: ${roomSelectOptions.find(opt => opt.value === selectedRoomId)?.label || 'N/A'}` : 'Chọn phòng nếu nhân viên sẽ làm việc tại phòng cụ thể (tùy chọn)'}
        </FormHelperText>
      </FormControl>

      <TextField
        fullWidth
        label="Tên vai trò"
        placeholder="Ví dụ: Giáo viên chính, Trợ giảng..."
        value={roleName}
        onChange={handleRoleNameChange}
        helperText="Tên vai trò của nhân viên (tùy chọn)"
        sx={{ mb: 2 }}
      />
    </Box>
  );
});

Step3AssignStaff.displayName = 'Step3AssignStaff';

export default Step3AssignStaff;

