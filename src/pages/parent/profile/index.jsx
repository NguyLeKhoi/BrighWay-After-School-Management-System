import React, { useState } from 'react';
import EditableField from '@components/Common/EditableField';
import styles from './Profile.module.css';

const ParentProfile = () => {
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Văn A',
    email: 'parent@example.com',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    dateOfBirth: '1985-01-01',
    emergencyContact: '0987654321'
  });

  const handleFieldSave = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
    console.log('Field updated:', fieldName, value);
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Thông tin cá nhân</h1>
          <p className={styles.subtitle}>Click vào field để chỉnh sửa</p>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span>NV</span>
            </div>
            <h2 className={styles.name}>{formData.fullName}</h2>
            <p className={styles.role}>Phụ huynh</p>
          </div>

          <div className={styles.form}>
            <div className={styles.formRow}>
              <EditableField
                label="Họ và tên"
                value={formData.fullName}
                type="text"
                onSave={(value) => handleFieldSave('fullName', value)}
              />
              <EditableField
                label="Email"
                value={formData.email}
                type="email"
                onSave={(value) => handleFieldSave('email', value)}
              />
            </div>

            <div className={styles.formRow}>
              <EditableField
                label="Số điện thoại"
                value={formData.phone}
                type="tel"
                onSave={(value) => handleFieldSave('phone', value)}
              />
              <EditableField
                label="Ngày sinh"
                value={formData.dateOfBirth}
                type="date"
                onSave={(value) => handleFieldSave('dateOfBirth', value)}
              />
            </div>

            <div className={styles.formGroup}>
              <EditableField
                label="Địa chỉ"
                value={formData.address}
                type="text"
                onSave={(value) => handleFieldSave('address', value)}
              />
            </div>

            <div className={styles.formGroup}>
              <EditableField
                label="Liên hệ khẩn cấp"
                value={formData.emergencyContact}
                type="tel"
                onSave={(value) => handleFieldSave('emergencyContact', value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfile;
