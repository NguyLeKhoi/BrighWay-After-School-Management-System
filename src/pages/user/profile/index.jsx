import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import userService from '../../../services/user.service';
import styles from './Profile.module.css';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: ''
  });

  const { showGlobalError, addNotification } = useApp();
  const { isLoading, showLoading, hideLoading } = useLoading();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    showLoading();
    setError(null);
    
    try {
      const currentUser = await userService.getCurrentUser();
      
      const userInfo = {
        fullName: currentUser.fullName || currentUser.name || '',
        email: currentUser.email || '',
        id: currentUser.id || ''
      };
      
      setUserData(userInfo);
      setEditForm({
        fullName: userInfo.fullName,
        email: userInfo.email
      });
    } catch (err) {
      console.error('❌ Error loading user data:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải thông tin tài khoản';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      fullName: userData?.fullName || '',
      email: userData?.email || ''
    });
  };

  const handleSave = async () => {
    if (!userData) return;
    
    try {
      showLoading();
      
      // TODO: Call API to update user info
      setUserData({
        ...userData,
        fullName: editForm.fullName,
        email: editForm.email
      });
      
      await loadUserData();
      setIsEditing(false);
      
      addNotification({
        message: 'Cập nhật thông tin thành công!',
        severity: 'success'
      });
    } catch (err) {
      console.error('❌ Update error:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (isLoading && !userData) {
    return <Loading />;
  }

  if (error && !userData) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{error}</p>
            <button className={styles.retryButton} onClick={loadUserData}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Thông tin tài khoản</h1>
          <p className={styles.subtitle}>Quản lý thông tin cá nhân của bạn</p>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {getInitials(userData?.fullName)}
            </div>
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>{userData?.fullName || 'Người dùng'}</h2>
              <p className={styles.userRole}>Tài khoản người dùng</p>
            </div>
            {!isEditing && (
              <button className={styles.editButton} onClick={handleEdit}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.3333 2.00001C11.5084 1.82491 11.7163 1.68698 11.9444 1.59431C12.1726 1.50165 12.4163 1.45605 12.6622 1.46024C12.9081 1.46444 13.1504 1.51835 13.3747 1.61874C13.599 1.71913 13.8006 1.86395 13.968 2.04468C14.1354 2.22541 14.2651 2.43835 14.3501 2.67091C14.4351 2.90347 14.4737 3.15094 14.4636 3.39868C14.4535 3.64642 14.3948 3.88945 14.2908 4.11379C14.1868 4.33813 14.0396 4.53927 13.8573 4.70601L13.3333 5.23001L10.8093 2.70601L11.3333 2.00001ZM9.80933 3.52401L2.66667 10.6667V13.3333H5.33333L12.476 6.19068L9.80933 3.52401Z" fill="currentColor"/>
                </svg>
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Họ và tên</label>
              {isEditing ? (
                <input
                  type="text"
                  className={styles.input}
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <div className={styles.fieldValue}>{userData?.fullName || 'Chưa có thông tin'}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  className={styles.input}
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Nhập email"
                />
              ) : (
                <div className={styles.fieldValue}>{userData?.email || 'Chưa có email'}</div>
              )}
            </div>

            {isEditing && (
              <div className={styles.actionButtons}>
                <button className={styles.cancelButton} onClick={handleCancel}>
                  Hủy
                </button>
                <button className={styles.saveButton} onClick={handleSave}>
                  Lưu thay đổi
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
