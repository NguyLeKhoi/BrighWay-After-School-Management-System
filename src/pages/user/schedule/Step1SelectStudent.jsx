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
      const selectedChild = children.find(c => c.id === selectedStudentId);
      updateData({ 
        studentId: selectedStudentId,
        studentName: selectedChild?.name || ''
      });
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
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      const mapped = items.map((child) => ({
        id: child.id,
        name: child.name || child.userName || 'Chưa có tên',
        age: child.age || null,
        grade: child.studentLevelName || child.studentLevel?.levelName || 'Chưa xác định',
        schoolName: child.schoolName || child.school?.schoolName || '',
        branchName: child.branchName || child.branch?.branchName || ''
      }));

      setChildren(mapped);
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải danh sách con';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
    const selectedChild = children.find(c => c.id === studentId);
    updateData({ 
      studentId: studentId,
      studentName: selectedChild?.name || ''
    });
  };

  const getInitials = (name = '') => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Chọn học sinh</h2>
        <p className={styles.stepSubtitle}>
          Chọn học sinh để đăng ký ca học
        </p>
        <button
          className={styles.secondaryButton}
          onClick={loadChildren}
          disabled={isLoading}
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
            onClick={loadChildren}
          >
            Thử lại
          </button>
        </div>
      ) : children.length > 0 ? (
        <div className={styles.scheduleGrid}>
          {children.map((child) => (
            <div
              key={child.id}
              className={`${styles.scheduleCard} ${
                selectedStudentId === child.id ? styles.scheduleCardSelected : ''
              }`}
              onClick={() => handleStudentSelect(child.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}
                  >
                    {getInitials(child.name)}
                  </div>
                  <div>
                    <p className={styles.cardLabel}>Học sinh</p>
                    <h3 className={styles.cardTitle}>{child.name}</h3>
                  </div>
                </div>
              </div>

              <div className={styles.infoGrid}>
                {child.age && (
                  <div>
                    <p className={styles.infoLabel}>Tuổi</p>
                    <p className={styles.infoValue}>{child.age} tuổi</p>
                  </div>
                )}
                <div>
                  <p className={styles.infoLabel}>Cấp độ</p>
                  <p className={styles.infoValue}>{child.grade}</p>
                </div>
                {child.schoolName && (
                  <div>
                    <p className={styles.infoLabel}>Trường</p>
                    <p className={styles.infoValue}>{child.schoolName}</p>
                  </div>
                )}
                {child.branchName && (
                  <div>
                    <p className={styles.infoLabel}>Chi nhánh</p>
                    <p className={styles.infoValue}>{child.branchName}</p>
                  </div>
                )}
              </div>

              {selectedStudentId === child.id && (
                <div className={styles.selectedIndicator}>
                  ✓ Đã chọn
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👶</div>
          <h3>Chưa có học sinh</h3>
          <p>Bạn chưa có học sinh nào. Vui lòng thêm học sinh trước khi đăng ký ca học.</p>
        </div>
      )}
    </div>
  );
});

Step1SelectStudent.displayName = 'Step1SelectStudent';

export default Step1SelectStudent;

