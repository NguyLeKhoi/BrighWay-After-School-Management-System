import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Loading from '../../../components/Common/Loading';
import studentService from '../../../services/student.service';
import { useApp } from '../../../contexts/AppContext';
import styles from './Schedule.module.css';

const Step1SelectStudent = forwardRef(({ data, updateData }, ref) => {
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(data?.studentId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showGlobalError } = useApp();

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!selectedStudentId) {
        return false;
      }
      updateData({ studentId: selectedStudentId });
      return true;
    }
  }));

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (data?.studentId) {
      setSelectedStudentId(data.studentId);
    }
  }, [data?.studentId]);

  const loadChildren = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await studentService.getMyChildren();
      const items = Array.isArray(response) ? response : [];
      setChildren(items);
      if (items.length > 0 && !selectedStudentId) {
        const firstChild = items[0];
        const firstId = firstChild.id;
        setSelectedStudentId(firstId);
        updateData({ 
          studentId: firstId,
          studentName: firstChild.name || firstChild.userName || ''
        });
      }
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải danh sách con';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const newId = e.target.value;
    setSelectedStudentId(newId);
    const selectedChild = children.find(c => c.id === newId);
    updateData({ 
      studentId: newId,
      studentName: selectedChild?.name || selectedChild?.userName || ''
    });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Chọn học sinh</h2>
        <p className={styles.stepSubtitle}>
          Chọn học sinh để xem các slot và gói đã đăng ký
        </p>
      </div>

      {isLoading ? (
        <div className={styles.inlineLoading}>
          <Loading />
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={loadChildren}>
            Thử lại
          </button>
        </div>
      ) : children.length > 0 ? (
        <div className={styles.selectorRow}>
          <label htmlFor="childSelect" className={styles.selectorLabel}>
            Học sinh *
          </label>
          <select
            id="childSelect"
            className={styles.selector}
            value={selectedStudentId}
            onChange={handleStudentChange}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name || child.userName || 'Không tên'}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👶</div>
          <h3>Chưa có thông tin học sinh</h3>
          <p>Vui lòng liên hệ Staff/Manager để được thêm con vào hệ thống.</p>
        </div>
      )}
    </div>
  );
});

Step1SelectStudent.displayName = 'Step1SelectStudent';

export default Step1SelectStudent;

