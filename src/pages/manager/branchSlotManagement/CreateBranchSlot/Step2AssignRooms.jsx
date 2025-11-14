import React, { useMemo, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Chip, FormHelperText } from '@mui/material';

const Step2AssignRooms = forwardRef(
  ({ data, updateData, stepIndex, totalSteps, roomOptions = [], dependenciesLoading = false, actionLoading = false }, ref) => {
    const [selectedRoomIds, setSelectedRoomIds] = useState(data.roomIds || []);

    useEffect(() => {
      setSelectedRoomIds(data.roomIds || []);
    }, [data.roomIds]);

    const roomSelectOptions = useMemo(
      () =>
        roomOptions.map((room) => ({
          value: room.id,
          label: room.name || 'N/A'
        })),
      [roomOptions]
    );

    const handleRoomChange = (event) => {
      const value = event.target.value;
      const newRoomIds = typeof value === 'string' ? value.split(',') : value;
      setSelectedRoomIds(newRoomIds);
      updateData({ roomIds: newRoomIds });
    };

    useImperativeHandle(
      ref,
      () => ({
        submit: async () => true
      }),
      []
    );

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 1.5, fontWeight: 600 }}>
          Bước {stepIndex + 1}/{totalSteps}: Gán phòng
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Chọn một hoặc nhiều phòng để gán vào ca học này. Bạn có thể bỏ qua bước này và gán sau.
        </Typography>

        <FormControl
          fullWidth
          sx={{ mb: 2 }}
          disabled={dependenciesLoading || actionLoading || roomOptions.length === 0}
        >
          <InputLabel id="rooms-select-label">Chọn phòng</InputLabel>
          <Select
            labelId="rooms-select-label"
            id="rooms-select"
            multiple
            value={selectedRoomIds}
            onChange={handleRoomChange}
            label="Chọn phòng"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((roomId) => {
                  const room = roomOptions.find((r) => r.id === roomId);
                  return <Chip key={roomId} label={room?.name || roomId} size="small" />;
                })}
              </Box>
            )}
          >
            {roomSelectOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {selectedRoomIds.length > 0 ? `Đã chọn ${selectedRoomIds.length} phòng` : 'Có thể bỏ qua bước này và gán phòng sau'}
          </FormHelperText>
        </FormControl>
      </Box>
    );
  }
);

Step2AssignRooms.displayName = 'Step2AssignRooms';

export default Step2AssignRooms;

