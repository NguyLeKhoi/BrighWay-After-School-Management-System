import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@components/Common/Card';
import Form from '@components/Common/Form';
import Loading from '@components/Common/Loading';
import { childSchema } from '../../../../utils/validationSchemas/childSchemas';
import { useApp } from '../../../../contexts/AppContext';
import { useLoading } from '../../../../hooks/useLoading';
import studentService from '../../../../services/student.service';
import walletService from '../../../../services/wallet.service';
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
  const { addNotification, showGlobalError } = useApp();
  const { isLoading, showLoading, hideLoading } = useLoading();

  const [children, setChildren] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  const fetchChildren = async (pageIndex = DEFAULT_PAGINATION.pageIndex, pageSize = DEFAULT_PAGINATION.pageSize) => {
    setError(null);
    showLoading();

    try {
      const response = await studentService.getCurrentUserStudents({ pageIndex, pageSize });
      const items = Array.isArray(response?.items) ? response.items : [];

      setChildren(items
        .map(transformStudent)
        .filter(Boolean)
      );

      setPagination({
        pageIndex: response?.pageIndex ?? pageIndex,
        pageSize: response?.pageSize ?? pageSize,
        totalItems: response?.totalCount ?? items.length,
        totalPages: response?.totalPages ?? Math.ceil((response?.totalCount ?? items.length) / pageSize)
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

  const handleAddChild = (data) => {
    const child = {
      id: Date.now().toString(),
      name: data.name,
      age: data.age ? parseInt(data.age, 10) : null,
      grade: data.grade || 'Chưa xác định',
      studentLevelName: data.grade || 'Chưa phân cấp',
      schoolName: '',
      branchName: '',
      status: 'pending',
      createdTime: new Date().toISOString(),
      avatar: getInitials(data.name),
      membershipType: data.grade || 'Chưa phân cấp'
    };

    setChildren(prev => [...prev, child]);
    setShowAddForm(false);

    addNotification({
      message: 'Thêm con thành công!',
      severity: 'success'
    });
  };

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
          <button 
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            + Thêm con
          </button>
        </div>

        {showAddForm && (
          <div className={styles.addForm}>
            <h3>Thêm con mới</h3>
            <Form
              schema={childSchema}
              onSubmit={handleAddChild}
              submitText="Lưu"
              fields={[
                { name: 'name', label: 'Tên con', type: 'text', required: true },
                { name: 'age', label: 'Tuổi', type: 'number', required: true },
                { name: 'grade', label: 'Lớp', type: 'text', required: true, placeholder: 'Ví dụ: Lớp 3' },
                { 
                  name: 'gender', 
                  label: 'Giới tính', 
                  type: 'select', 
                  required: true,
                  options: [
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' }
                  ]
                },
                { name: 'dateOfBirth', label: 'Ngày sinh', type: 'date' }
              ]}
              defaultValues={{
                name: '',
                age: '',
                grade: '',
                gender: 'male',
                dateOfBirth: ''
              }}
            />
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => setShowAddForm(false)}
            >
              Hủy
            </button>
          </div>
        )}

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
            <h3>Chưa có con nào</h3>
            <p>Thêm con đầu tiên để bắt đầu sử dụng hệ thống</p>
            <button 
              className={styles.addFirstButton}
              onClick={() => setShowAddForm(true)}
            >
              Thêm con đầu tiên
            </button>
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
                  { text: 'Xem Profile', primary: false, onClick: () => navigate(`/parent/children/${child.id}/profile`) },
                  { text: 'Lịch học', primary: true, onClick: () => navigate(`/parent/children/${child.id}/schedule`) }
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
