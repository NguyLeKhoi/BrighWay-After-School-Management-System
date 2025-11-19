import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Loading from '../../../components/Common/Loading';
import branchSlotService from '../../../services/branchSlot.service';
import { useApp } from '../../../contexts/AppContext';
import styles from './Schedule.module.css';

const Step3SelectRoom = forwardRef(({ data, updateData }, ref) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(data?.roomId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showGlobalError } = useApp();

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!selectedRoomId) {
        return false;
      }
      const selectedRoom = rooms.find(r => r.id === selectedRoomId);
      updateData({ 
        roomId: selectedRoomId,
        room: selectedRoom
      });
      return true;
    }
  }));

  useEffect(() => {
    if (data?.slotId) {
      loadRooms(data.slotId);
    }
  }, [data?.slotId]);

  useEffect(() => {
    if (data?.roomId) {
      setSelectedRoomId(data.roomId);
    }
  }, [data?.roomId]);

  const loadRooms = async (slotId) => {
    if (!slotId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await branchSlotService.getRoomsByBranchSlot(slotId, {
        pageIndex: 1,
        pageSize: 20
      });
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      const mapped = items.map((room) => ({
        id: room.id,
        name: room.roomName || 'Phòng không tên',
        facilityName: room.facilityName || room.facility?.name || '',
        branchName: room.branch?.branchName || room.branchName || '',
        capacity: room.capacity || 0
      }));

      setRooms(mapped);
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải phòng cho slot';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    const selectedRoom = rooms.find(r => r.id === roomId);
    updateData({ 
      roomId: roomId,
      room: selectedRoom
    });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Chọn phòng</h2>
        <p className={styles.stepSubtitle}>
          Chọn phòng phù hợp cho slot đã chọn
        </p>
        {data?.slot && (
          <div className={styles.selectedSlotInfo}>
            <p className={styles.infoLabel}>Slot đã chọn:</p>
            <p className={styles.infoValue}>
              {data.slot.timeframeName} ({data.slot.startTime?.substring(0, 5)} - {data.slot.endTime?.substring(0, 5)})
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className={styles.inlineLoading}>
          <Loading />
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => loadRooms(data?.slotId)}
            disabled={!data?.slotId}
          >
            Thử lại
          </button>
        </div>
      ) : rooms.length > 0 ? (
        <div className={styles.roomsGrid}>
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`${styles.roomCard} ${
                selectedRoomId === room.id ? styles.roomCardSelected : ''
              }`}
              onClick={() => handleRoomSelect(room.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.roomHeader}>
                <h3>{room.name}</h3>
                <span className={styles.roomCapacity}>{room.capacity} chỗ</span>
              </div>
              <p className={styles.infoLabel}>Chi nhánh</p>
              <p className={styles.infoValue}>{room.branchName || '—'}</p>
              {selectedRoomId === room.id && (
                <div className={styles.selectedIndicator}>
                  ✓ Đã chọn phòng này
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏫</div>
          <h3>Chưa có phòng phù hợp</h3>
          <p>Slot đã chọn hiện chưa có phòng phù hợp.</p>
        </div>
      )}
    </div>
  );
});

Step3SelectRoom.displayName = 'Step3SelectRoom';

export default Step3SelectRoom;

