import React, { useImperativeHandle, forwardRef } from 'react';
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

const Step5Confirm = forwardRef(({ data }, ref) => {
  useImperativeHandle(ref, () => ({
    submit: async () => {
      // No validation needed, just return true
      return true;
    }
  }));

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    try {
      return timeString.length === 5 ? timeString : timeString.substring(0, 5);
    } catch {
      return timeString;
    }
  };

  const getNextSlotDate = (slot) => {
    const now = new Date();
    if (!slot) {
      return now;
    }

    const targetWeekDay = typeof slot.weekDay === 'number' ? slot.weekDay : now.getDay();
    const todayWeekDay = now.getDay();
    let diff = targetWeekDay - todayWeekDay;
    if (diff < 0) diff += 7;

    const result = new Date(now);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() + diff);

    const time = slot.startTime || '08:00';
    const [hours = '8', minutes = '0'] = time.split(':');
    result.setHours(Number(hours), Number(minutes), 0, 0);

    // Nếu slot đã trôi qua trong ngày hôm nay, chuyển sang tuần sau
    if (diff === 0 && result <= now) {
      result.setDate(result.getDate() + 7);
    }

    return result;
  };

  const slotDate = data?.slot ? getNextSlotDate(data.slot) : null;
  const formattedDate = slotDate
    ? slotDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '—';

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Xác nhận đặt lịch</h2>
        <p className={styles.stepSubtitle}>
          Vui lòng kiểm tra lại thông tin trước khi xác nhận
        </p>
      </div>

      <div className={styles.confirmCard}>
        <div className={styles.confirmSection}>
          <h3 className={styles.confirmSectionTitle}>Thông tin học sinh</h3>
          <div className={styles.confirmInfoGrid}>
            <div>
              <p className={styles.infoLabel}>Học sinh</p>
              <p className={styles.infoValue}>
                {data?.studentName || 'Chưa chọn'}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.confirmSection}>
          <h3 className={styles.confirmSectionTitle}>Thông tin slot</h3>
          <div className={styles.confirmInfoGrid}>
            <div>
              <p className={styles.infoLabel}>Khung giờ</p>
              <p className={styles.infoValue}>
                {data?.slot?.timeframeName || '—'} (
                {formatTime(data?.slot?.startTime)} - {formatTime(data?.slot?.endTime)})
              </p>
            </div>
            <div>
              <p className={styles.infoLabel}>Thứ</p>
              <p className={styles.infoValue}>
                {WEEKDAY_LABELS[data?.slot?.weekDay] ?? '—'}
              </p>
            </div>
            <div>
              <p className={styles.infoLabel}>Ngày học</p>
              <p className={styles.infoValue}>{formattedDate}</p>
            </div>
            <div>
              <p className={styles.infoLabel}>Chi nhánh</p>
              <p className={styles.infoValue}>{data?.slot?.branchName || '—'}</p>
            </div>
          </div>
        </div>

        <div className={styles.confirmSection}>
          <h3 className={styles.confirmSectionTitle}>Thông tin phòng</h3>
          <div className={styles.confirmInfoGrid}>
            <div>
              <p className={styles.infoLabel}>Tên phòng</p>
              <p className={styles.infoValue}>{data?.room?.name || '—'}</p>
            </div>
            <div>
              <p className={styles.infoLabel}>Sức chứa</p>
              <p className={styles.infoValue}>{data?.room?.capacity || '—'} chỗ</p>
            </div>
          </div>
        </div>

        <div className={styles.confirmSection}>
          <h3 className={styles.confirmSectionTitle}>Thông tin gói</h3>
          <div className={styles.confirmInfoGrid}>
            <div>
              <p className={styles.infoLabel}>Gói đã chọn</p>
              <p className={styles.infoValue}>
                {data?.subscriptionName || '—'}
              </p>
            </div>
          </div>
        </div>

        {data?.parentNote && (
          <div className={styles.confirmSection}>
            <h3 className={styles.confirmSectionTitle}>Ghi chú</h3>
            <p className={styles.confirmNote}>{data.parentNote}</p>
          </div>
        )}
      </div>
    </div>
  );
});

Step5Confirm.displayName = 'Step5Confirm';

export default Step5Confirm;

