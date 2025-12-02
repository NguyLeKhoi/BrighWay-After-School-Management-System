import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import ContentLoading from '../../../../../components/Common/ContentLoading';
import branchSlotService from '../../../../../services/branchSlot.service';
import { useApp } from '../../../../../contexts/AppContext';
import { parseDateFromUTC7 } from '../../../../../utils/dateHelper';
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

const Step2SelectSlotsByDate = forwardRef(({ data, updateData, stepIndex, totalSteps }, ref) => {
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
    if (data?.studentId && data?.selectedDate) {
      loadAvailableSlots(data.studentId, data.selectedDate);
    }
  }, [data?.studentId, data?.selectedDate]);

  useEffect(() => {
    if (data?.slotId) {
      setSelectedSlotId(data.slotId);
    }
  }, [data?.slotId]);

  const loadAvailableSlots = async (studentId, selectedDate) => {
    if (!studentId || !selectedDate) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Convert date to proper format
      const dateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      
      const response = await branchSlotService.getAvailableSlotsForStudent(studentId, {
        pageIndex: 1,
        pageSize: 100,
        date: dateObj
      });
      
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      if (items.length === 0) {
        setSlots([]);
        return;
      }

      // Parse selectedDate for comparison
      const selectedDateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

      const mapped = items
        .map((slot) => {
          const slotDate = slot.date ? parseDateFromUTC7(slot.date) : null;
          
          // If slot has specific date, check if it matches selectedDate
          if (slotDate) {
            const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
            // Only include slot if date matches
            if (slotDateOnly.getTime() !== selectedDateOnly.getTime()) {
              return null; // Filter out this slot
            }
          }
          
          return {
            id: slot.id,
            branchName: slot.branch?.branchName || slot.branchName || '',
            weekDay: slot.weekDate,
            date: slotDate, // Parse date của branch slot nếu có
            status: slot.status || 'Available',
            timeframeName: slot.timeframe?.name || slot.timeframeName || '',
            startTime: slot.timeframe?.startTime || slot.startTime,
            endTime: slot.timeframe?.endTime || slot.endTime,
            slotTypeName: slot.slotType?.name || slot.slotTypeName || '',
            slotTypeDescription: slot.slotType?.description || slot.slotTypeDescription || '',
            slotTypeId: slot.slotTypeId,
            allowedPackages: slot.allowedPackages || [],
            rooms: slot.rooms || [], // Lưu rooms từ response
            staff: slot.staff || [], // Lưu staff từ response
            description: slot.description || ''
          };
        })
        .filter(slot => slot !== null); // Remove filtered out slots

      setSlots(mapped);
    } catch (err) {
      let errorMessage = 'Không thể tải slot phù hợp';
      
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err?.message) {
        errorMessage = err.message;
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

  const formatDate = (date) => {
    if (!date) return '—';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const handleSlotSelect = (slotId) => {
    if (selectedSlotId === slotId) {
      handleSlotDeselect();
      return;
    }

    setSelectedSlotId(slotId);
    const selectedSlot = slots.find(s => s.id === slotId);
    updateData({ 
      slotId: slotId,
      slot: selectedSlot
    });
  };

  const handleSlotDeselect = () => {
    setSelectedSlotId('');
    updateData({ 
      slotId: null,
      slot: null
    });
  };

  const handleCancelClick = (e, slotId) => {
    e.stopPropagation();
    if (selectedSlotId === slotId) {
      handleSlotDeselect();
    }
  };

  if (!data?.selectedDate) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.emptyState}>
          <h3>Vui lòng chọn ngày trước</h3>
          <p>Bạn cần chọn ngày ở bước trước để xem các slot khả dụng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Bước {stepIndex + 1}/{totalSteps}: Chọn slot</h2>
        <p className={styles.stepSubtitle}>
          Chọn slot khả dụng cho ngày {formatDate(data.selectedDate)}
        </p>
      </div>

      {isLoading && <ContentLoading isLoading={isLoading} text="Đang tải slot phù hợp..." />}
      {!isLoading && error ? (
        <div className={styles.errorState}>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => loadAvailableSlots(data?.studentId, data?.selectedDate)}
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
                  {slot.status || 'Khả dụng'}
                </span>
              </div>

              <div className={styles.infoGrid}>
                <div>
                  <p className={styles.infoLabel}>Chi nhánh</p>
                  <p className={styles.infoValue}>{slot.branchName || '—'}</p>
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
          <p>Không có slot nào khả dụng cho ngày {formatDate(data.selectedDate)}.</p>
        </div>
      )}
    </div>
  );
});

Step2SelectSlotsByDate.displayName = 'Step2SelectSlotsByDate';

export default Step2SelectSlotsByDate;

