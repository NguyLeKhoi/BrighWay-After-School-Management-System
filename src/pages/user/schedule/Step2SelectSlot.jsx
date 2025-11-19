import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Loading from '../../../components/Common/Loading';
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
      updateData({ 
        slotId: selectedSlotId,
        slot: selectedSlot
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
    if (!studentId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await branchSlotService.getAvailableSlotsForStudent(studentId, {
        pageIndex: 1,
        pageSize: 20
      });
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      const mapped = items.map((slot) => ({
        id: slot.id,
        branchName: slot.branch?.branchName || slot.branchName || '',
        weekDay: slot.weekDate,
        status: slot.status || 'Available',
        timeframeName: slot.timeframe?.name || slot.timeframeName || '',
        startTime: slot.timeframe?.startTime || slot.startTime,
        endTime: slot.timeframe?.endTime || slot.endTime,
        slotTypeName: slot.slotType?.name || slot.slotTypeName || '',
        slotTypeDescription: slot.slotType?.description || slot.slotTypeDescription || '',
        description: slot.description || ''
      }));

      setSlots(mapped);
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải slot phù hợp';
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

  const handleSlotSelect = (slotId) => {
    setSelectedSlotId(slotId);
    const selectedSlot = slots.find(s => s.id === slotId);
    updateData({ 
      slotId: slotId,
      slot: selectedSlot
    });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Chọn slot phù hợp</h2>
        <p className={styles.stepSubtitle}>
          Danh sách khung giờ học mà chi nhánh có thể xếp cho học sinh
        </p>
        <button
          className={styles.secondaryButton}
          onClick={() => loadAvailableSlots(data?.studentId)}
          disabled={!data?.studentId}
        >
          Tải lại
        </button>
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

              {selectedSlotId === slot.id && (
                <div className={styles.selectedIndicator}>
                  ✓ Đã chọn
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏱️</div>
          <h3>Chưa có slot phù hợp</h3>
          <p>Chi nhánh chưa có slot trống cho học sinh này.</p>
        </div>
      )}
    </div>
  );
});

Step2SelectSlot.displayName = 'Step2SelectSlot';

export default Step2SelectSlot;

