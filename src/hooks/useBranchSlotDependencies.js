import { useState, useCallback } from 'react';
import timeframeService from '../services/timeframe.service';
import slotTypeService from '../services/slotType.service';
import roomService from '../services/room.service';
import userService from '../services/user.service';

/**
 * Custom hook to fetch branch slot dependencies
 * Returns lists of timeframes, slot types, rooms, and staff with their IDs and names
 * for use in branch slot creation/editing forms
 */
const useBranchSlotDependencies = () => {
  const [timeframes, setTimeframes] = useState([]);
  const [slotTypes, setSlotTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dependencies function
  const fetchDependencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dependencies in parallel
      // For staff and rooms, use the dedicated endpoints to get data in manager's branch
      // These endpoints automatically filter by the current manager's branch
      const fetchPromises = [
        timeframeService.getAllTimeframes(),
        slotTypeService.getAllSlotTypes(),
        roomService.getRoomsInMyBranch(1, 1000), // Get rooms in manager's branch
        userService.getStaffInMyBranch({ 
          pageIndex: 1, 
          pageSize: 1000
        })
      ];

      const [timeframesData, slotTypesData, roomsResponse, staffResponse] = await Promise.all(fetchPromises);
      
      const roomsData = roomsResponse?.items || [];
      const staffData = staffResponse?.items || [];

      setTimeframes(timeframesData || []);
      setSlotTypes(slotTypesData || []);
      setRooms(roomsData || []);
      setStaff(staffData || []);
    } catch (err) {
      console.error('Error fetching branch slot dependencies:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Transform data for easier use in forms
  const timeframeOptions = timeframes.map(timeframe => ({
    id: timeframe.id,
    name: timeframe.name,
    description: timeframe.description,
    startTime: timeframe.startTime,
    endTime: timeframe.endTime
  }));

  const slotTypeOptions = slotTypes.map(slotType => ({
    id: slotType.id,
    name: slotType.name,
    description: slotType.description
  }));

  const roomOptions = rooms.map(room => ({
    id: room.id,
    name: room.roomName || room.name
  }));

  const staffOptions = staff.map(user => ({
    id: user.id,
    name: user.fullName || user.name,
    email: user.email
  }));

  return {
    // Raw data
    timeframes,
    slotTypes,
    rooms,
    staff,

    // Formatted options for dropdowns
    timeframeOptions,
    slotTypeOptions,
    roomOptions,
    staffOptions,

    // State
    loading,
    error,

    // Helper functions
    getTimeframeById: (id) => timeframes.find(t => t.id === id),
    getSlotTypeById: (id) => slotTypes.find(st => st.id === id),
    getRoomById: (id) => rooms.find(r => r.id === id),
    getStaffById: (id) => staff.find(s => s.id === id),

    // Fetch function - call this when you actually need the data
    fetchDependencies,
    // Refresh function - alias for fetchDependencies
    refresh: fetchDependencies
  };
};

export default useBranchSlotDependencies;

