import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@components/Common/Card';
import Loading from '@components/Common/Loading';
import { useApp } from '../../../../contexts/AppContext';
import { useLoading } from '../../../../hooks/useLoading';
import studentService from '../../../../services/student.service';
import styles from './Children.module.css';

const DEFAULT_PAGINATION = {
  pageIndex: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0
};

const getInitials = (name = '') => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDate = (value) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch (error) {
    return null;
  }
};

const transformStudent = (student) => {
  if (!student) return null;

  const studentLevelName = student.studentLevelName || student.studentLevel?.levelName;
  const schoolName = student.schoolName || student.school?.schoolName;
  const branchName = student.branchName || student.branch?.branchName;

  return {
    id: student.id,
    name: student.name || 'Chưa có tên',
    age: student.age ?? null,
    grade: studentLevelName || 'Chưa xác định',
    studentLevelName: studentLevelName,
    schoolName,
    branchName,
    status: student.status ? 'active' : 'pending',
    createdTime: student.createdTime,
    avatar: getInitials(student.name || student.userName),
    membershipType: studentLevelName || 'Chưa phân cấp',
    allowanceWalletData: student.allowanceWallet || null
  };
};

const ChildrenList = () => {
  const navigate = useNavigate();
  const { showGlobalError } = useApp();
  const { isLoading, showLoading, hideLoading } = useLoading();

  const [children, setChildren] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [error, setError] = useState(null);

  const fetchChildren = async (pageIndex = DEFAULT_PAGINATION.pageIndex, pageSize = DEFAULT_PAGINATION.pageSize) => {
    setError(null);
    showLoading();

    try {
      const response = await studentService.getMyChildren();
      // API mới trả về array trực tiếp, không phải object có items
      const items = Array.isArray(response) ? response : (Array.isArray(response?.items) ? response.items : []);

      setChildren(items
        .map(transformStudent)
        .filter(Boolean)
      );

      // API mới không có pagination, nên tính toán từ array
      setPagination({
        pageIndex: 1,
        pageSize: items.length,
        totalItems: items.length,
        totalPages: 1
      });
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể tải danh sách con';

      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleRetry = () => {
    fetchChildren(pagination.pageIndex, pagination.pageSize);
  };

  const renderSubtitle = (child) => {
    const ageText = child.age ? `${child.age} tuổi` : null;
    const level = child.studentLevelName;
    const branch = child.branchName;
    return [ageText, level, branch].filter(Boolean).join(' • ');
  };

  return (
    <div className={styles.childrenPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Quản lý con cái</h1>
        </div>

        {isLoading && children.length === 0 && (
          <div className={styles.loadingState}>
            <Loading />
          </div>
        )}

        {error && children.length === 0 && !isLoading && (
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{error}</p>
            <button className={styles.retryButton} onClick={handleRetry}>
              Thử lại
            </button>
          </div>
        )}

        {!isLoading && !error && children.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👶</div>
            <h3>Chưa có thông tin con</h3>
            <p>
              Bạn chưa có thêm con vào trung tâm, vui lòng liên hệ Staff/Manager để thêm.
            </p>
          </div>
        )}

        {children.length > 0 && (
          <div className={styles.childrenGrid}>
            {children.map((child) => (
              <Card
                key={child.id}
                title={child.name}
                subtitle={renderSubtitle(child)}
                avatar={child.avatar}
                badges={[
                  { text: child.membershipType, type: 'price' }
                ]}
                status={{
                  text: child.status === 'active' ? 'Hoạt động' : 'Chờ duyệt',
                  type: child.status
                }}
                infoRows={[
                  child.schoolName ? { label: 'Trường', value: child.schoolName } : null,
                  child.branchName ? { label: 'Chi nhánh', value: child.branchName } : null,
                  formatDate(child.createdTime) ? { label: 'Ngày tham gia', value: formatDate(child.createdTime) } : null
                ].filter(Boolean)}
                actions={[
                  { text: 'Xem Profile', primary: false, onClick: () => navigate(`/family/children/${child.id}/profile`) },
                  { text: 'Lịch học', primary: true, onClick: () => navigate(`/family/children/${child.id}/schedule`) }
                ]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenList;
