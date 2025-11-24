import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import ContentLoading from '../../../components/Common/ContentLoading';
import branchSlotService from '../../../services/branchSlot.service';
import { useApp } from '../../../contexts/AppContext';
import styles from './Schedule.module.css';

const WEEKDAY_LABELS = {
  0: 'Chủ nhật',
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy'
};

const Step2SelectSlot = forwardRef(({ data, updateData }, ref) => {
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(data?.slotId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showGlobalError } = useApp();

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!selectedSlotId) {
        return false;
      }
      const selectedSlot = slots.find(s => s.id === selectedSlotId);
      
      // Auto-assign roomId and room info when submitting
      let roomData = {};
      
      if (selectedSlot?.roomId) {
        roomData = {
          roomId: selectedSlot.roomId,
          room: {
            id: selectedSlot.roomId,
            name: selectedSlot.roomName || 'Phòng tự động'
          }
        };
      } else {
        // Try to get room from API if not already loaded
        try {
          const roomsResponse = await branchSlotService.getRoomsByBranchSlot(selectedSlotId, {
            pageIndex: 1,
            pageSize: 1
          });
          const rooms = Array.isArray(roomsResponse)
            ? roomsResponse
            : Array.isArray(roomsResponse?.items)
              ? roomsResponse.items
              : [];
          
          if (rooms.length > 0) {
            const firstRoom = rooms[0];
            roomData = {
              roomId: firstRoom.id,
              room: {
                id: firstRoom.id,
                name: firstRoom.roomName || 'Phòng tự động',
                capacity: firstRoom.capacity || 0
              }
            };
          }
        } catch (err) {
          console.warn('Could not load room for slot', err);
          // Continue without room - will be assigned by backend
        }
      }
      
      updateData({ 
        slotId: selectedSlotId,
        slot: selectedSlot,
        ...roomData
      });
      return true;
    }
  }));

  useEffect(() => {
    if (data?.studentId) {
      loadAvailableSlots(data.studentId);
    }
  }, [data?.studentId]);

  useEffect(() => {
    if (data?.slotId) {
      setSelectedSlotId(data.slotId);
    }
  }, [data?.slotId]);

  const loadAvailableSlots = async (studentId) => {
    if (!studentId) {
      console.warn('loadAvailableSlots: studentId is missing');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading available slots for studentId:', studentId);
      const response = await branchSlotService.getAvailableSlotsForStudent(studentId, {
        pageIndex: 1,
        pageSize: 20
      });
      
      console.log('API Response:', response);
      
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      console.log('Extracted items:', items);
      console.log('Items count:', items.length);

      if (items.length === 0) {
        console.warn('No slots found in response');
        setSlots([]);
        return;
      }

      const mapped = items.map((slot) => {
        // Auto-assign room from first staff member if available
        // From Swagger, staff is an array, but may be empty
        const firstStaff = Array.isArray(slot.staff) && slot.staff.length > 0 ? slot.staff[0] : null;
        const roomId = firstStaff?.roomId || null;
        const roomName = firstStaff?.roomName || null;

        return {
          id: slot.id,
          branchName: slot.branch?.branchName || slot.branchName || '',
          weekDay: slot.weekDate,
          status: slot.status || 'Available',
          timeframeName: slot.timeframe?.name || slot.timeframeName || '',
          startTime: slot.timeframe?.startTime || slot.startTime,
          endTime: slot.timeframe?.endTime || slot.endTime,
          slotTypeName: slot.slotType?.name || slot.slotTypeName || '',
          slotTypeDescription: slot.slotType?.description || slot.slotTypeDescription || '',
          description: slot.description || '',
          roomId: roomId,
          roomName: roomName
        };
      });

      console.log('Mapped slots:', mapped);
      setSlots(mapped);
    } catch (err) {
      console.error('Error loading available slots:', err);
      console.error('Error details:', {
        message: err?.message,
        response: err?.response,
        data: err?.response?.data,
        status: err?.response?.status,
        studentId: studentId
      });
      
      // Extract error message from various possible locations
      let errorMessage = 'Không thể tải slot phù hợp';
      
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.join(', ');
        }
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    try {
      return timeString.length === 5 ? timeString : timeString.substring(0, 5);
    } catch {
      return timeString;
    }
  };

  const handleSlotSelect = async (slotId) => {
    // If clicking the same slot that's already selected, deselect it
    if (selectedSlotId === slotId) {
      handleSlotDeselect();
      return;
    }

    setSelectedSlotId(slotId);
    const selectedSlot = slots.find(s => s.id === slotId);
    
    // Auto-assign roomId and room info when slot is selected
    let roomData = {};
    
    if (selectedSlot?.roomId) {
      // Room already available from slot data
      roomData = {
        roomId: selectedSlot.roomId,
        room: {
          id: selectedSlot.roomId,
          name: selectedSlot.roomName || 'Phòng tự động'
        }
      };
    } else {
      // Try to get room from API
      try {
        const roomsResponse = await branchSlotService.getRoomsByBranchSlot(slotId, {
          pageIndex: 1,
          pageSize: 1
        });
        const rooms = Array.isArray(roomsResponse)
          ? roomsResponse
          : Array.isArray(roomsResponse?.items)
            ? roomsResponse.items
            : [];
        
        if (rooms.length > 0) {
          const firstRoom = rooms[0];
          roomData = {
            roomId: firstRoom.id,
            room: {
              id: firstRoom.id,
              name: firstRoom.roomName || 'Phòng tự động',
              capacity: firstRoom.capacity || 0
            }
          };
        }
      } catch (err) {
        console.warn('Could not load room for slot', err);
        // Continue without room - will be assigned by backend
      }
    }
    
    updateData({ 
      slotId: slotId,
      slot: selectedSlot,
      ...roomData
    });
  };

  const handleSlotDeselect = () => {
    setSelectedSlotId('');
    updateData({ 
      slotId: null,
      slot: null,
      roomId: null,
      room: null
    });
  };

  const handleCancelClick = (e, slotId) => {
    e.stopPropagation(); // Prevent card click event
    if (selectedSlotId === slotId) {
      handleSlotDeselect();
    }
  };

  return (
    <div className={styles.stepContainer}>
      {isLoading && <ContentLoading isLoading={isLoading} text="Đang tải slot phù hợp..." />}
      {!isLoading && error ? (
        <div className={styles.errorState}>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => loadAvailableSlots(data?.studentId)}
          >
            Thử lại
          </button>
        </div>
      ) : slots.length > 0 ? (
        <div className={styles.scheduleGrid}>
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`${styles.scheduleCard} ${
                selectedSlotId === slot.id ? styles.scheduleCardSelected : ''
              }`}
              onClick={() => handleSlotSelect(slot.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardLabel}>{slot.timeframeName || 'Slot phù hợp'}</p>
                  <h3 className={styles.cardTitle}>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </h3>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    slot.status?.toLowerCase() === 'available' ? styles.active : styles.pending
                  }`}
                >
                  {slot.status || 'Available'}
                </span>
              </div>

              <div className={styles.infoGrid}>
                <div>
                  <p className={styles.infoLabel}>Chi nhánh</p>
                  <p className={styles.infoValue}>{slot.branchName || '—'}</p>
                </div>
                <div>
                  <p className={styles.infoLabel}>Thứ</p>
                  <p className={styles.infoValue}>{WEEKDAY_LABELS[slot.weekDay] ?? '—'}</p>
                </div>
                <div>
                  <p className={styles.infoLabel}>Loại slot</p>
                  <p className={styles.infoValue}>{slot.slotTypeName || '—'}</p>
                </div>
              </div>

              {slot.slotTypeDescription && (
                <div className={styles.benefits}>
                  <p className={styles.infoLabel}>Mô tả</p>
                  <p className={styles.description}>{slot.slotTypeDescription}</p>
                </div>
              )}

              {selectedSlotId === slot.id ? (
                <button
                  className={styles.cancelButton}
                  onClick={(e) => handleCancelClick(e, slot.id)}
                  type="button"
                >
                  ✕ Hủy chọn
                </button>
              ) : (
                <button
                  className={styles.selectButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlotSelect(slot.id);
                  }}
                  type="button"
                >
                  ✓ Chọn
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏱️</div>
          <h3>Chưa có slot phù hợp</h3>
          <p>Chi nhánh chưa có slot trống cho trẻ em này.</p>
        </div>
      )}
    </div>
  );
});

Step2SelectSlot.displayName = 'Step2SelectSlot';

export default Step2SelectSlot;

