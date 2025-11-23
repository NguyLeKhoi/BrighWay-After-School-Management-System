import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Inventory as PackageIcon } from '@mui/icons-material';
import Loading from '../../../components/Common/Loading';
import packageService from '../../../services/package.service';
import { useApp } from '../../../contexts/AppContext';
import styles from './Schedule.module.css';

const Step4SelectPackage = forwardRef(({ data, updateData }, ref) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionId, setSubscriptionId] = useState(data?.subscriptionId || '');
  const [parentNote, setParentNote] = useState(data?.parentNote || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showGlobalError } = useApp();

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!subscriptionId) {
        return false;
      }
      updateData({ 
        subscriptionId: subscriptionId,
        parentNote: parentNote
      });
      return true;
    }
  }));

  useEffect(() => {
    if (data?.studentId) {
      loadSubscriptions(data.studentId);
    }
  }, [data?.studentId]);

  useEffect(() => {
    if (data?.subscriptionId) {
      setSubscriptionId(data.subscriptionId);
    }
    if (data?.parentNote !== undefined) {
      setParentNote(data.parentNote);
    }
  }, [data?.subscriptionId, data?.parentNote]);

  const loadSubscriptions = async (studentId) => {
    if (!studentId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await packageService.getSubscriptionsByStudent(studentId);
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (Array.isArray(response?.items)) {
        items = response.items;
      } else if (response?.id) {
        items = [response];
      }

      const mapped = items
        .map((sub) => ({
          id: sub.id,
          name: sub.packageName || 'Gói không tên',
          status: sub.status?.toLowerCase() || 'pending'
        }))
        .filter((sub) => sub.status !== 'cancelled');

      setSubscriptions(mapped);
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải gói đã mua';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionChange = (e) => {
    const newId = e.target.value;
    setSubscriptionId(newId);
    const selectedSub = subscriptions.find(s => s.id === newId);
    updateData({ 
      subscriptionId: newId,
      subscriptionName: selectedSub?.name || ''
    });
  };

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setParentNote(newNote);
    updateData({ parentNote: newNote });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Chọn gói và ghi chú</h2>
        <p className={styles.stepSubtitle}>
          Chọn gói đã mua và thêm ghi chú (nếu có)
        </p>
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
            onClick={() => loadSubscriptions(data?.studentId)}
          >
            Thử lại
          </button>
        </div>
      ) : subscriptions.length > 0 ? (
        <div className={styles.bookingForm}>
          <div className={styles.bookingSummary}>
            {data?.slot && (
              <div>
                <p className={styles.infoLabel}>Slot đã chọn</p>
                <p className={styles.infoValue}>
                  {data.slot.timeframeName || '—'} (
                  {data.slot.startTime?.substring(0, 5) || '—'} - {data.slot.endTime?.substring(0, 5) || '—'})
                </p>
              </div>
            )}
            {data?.selectedDate && (
              <div>
                <p className={styles.infoLabel}>Ngày học</p>
                <p className={styles.infoValue}>
                  {new Date(data.selectedDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Gói đã mua *</label>
            <select
              className={styles.formSelect}
              value={subscriptionId}
              onChange={handleSubscriptionChange}
            >
              <option value="">-- Chọn gói --</option>
              {subscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.status === 'active' ? 'Đang hoạt động' : sub.status})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ghi chú cho nhân viên</label>
            <textarea
              className={styles.formTextarea}
              rows={4}
              placeholder="Ví dụ: Con cần giáo viên hỗ trợ bơi..."
              value={parentNote}
              onChange={handleNoteChange}
            />
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <PackageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          </div>
          <h3>Chưa có gói đã mua</h3>
          <p>Bạn cần mua gói học trước khi đặt lịch.</p>
        </div>
      )}
    </div>
  );
});

Step4SelectPackage.displayName = 'Step4SelectPackage';

export default Step4SelectPackage;

