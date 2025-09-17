import React, { useState } from 'react';
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

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const handleFieldClick = (fieldName) => {
    setEditingField(fieldName);
    setTempValue(formData[fieldName]);
  };

  const handleFieldChange = (e) => {
    setTempValue(e.target.value);
  };

  const handleFieldBlur = (fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: tempValue
    });
    setEditingField(null);
    setTempValue('');
    // Handle profile update
    console.log('Field updated:', fieldName, tempValue);
  };

  const handleKeyPress = (e, fieldName) => {
    if (e.key === 'Enter') {
      setFormData({
        ...formData,
        [fieldName]: tempValue
      });
      setEditingField(null);
      setTempValue('');
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
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
              <div className={styles.formGroup}>
                <label className={styles.label}>Họ và tên</label>
                {editingField === 'fullName' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={handleFieldChange}
                    onBlur={() => handleFieldBlur('fullName')}
                    onKeyDown={(e) => handleKeyPress(e, 'fullName')}
                    className={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <div 
                    className={styles.fieldValue}
                    onClick={() => handleFieldClick('fullName')}
                  >
                    {formData.fullName}
                    <span className={styles.editIcon}>✏️</span>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                {editingField === 'email' ? (
                  <input
                    type="email"
                    value={tempValue}
                    onChange={handleFieldChange}
                    onBlur={() => handleFieldBlur('email')}
                    onKeyDown={(e) => handleKeyPress(e, 'email')}
                    className={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <div 
                    className={styles.fieldValue}
                    onClick={() => handleFieldClick('email')}
                  >
                    {formData.email}
                    <span className={styles.editIcon}>✏️</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Số điện thoại</label>
                {editingField === 'phone' ? (
                  <input
                    type="tel"
                    value={tempValue}
                    onChange={handleFieldChange}
                    onBlur={() => handleFieldBlur('phone')}
                    onKeyDown={(e) => handleKeyPress(e, 'phone')}
                    className={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <div 
                    className={styles.fieldValue}
                    onClick={() => handleFieldClick('phone')}
                  >
                    {formData.phone}
                    <span className={styles.editIcon}>✏️</span>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Ngày sinh</label>
                {editingField === 'dateOfBirth' ? (
                  <input
                    type="date"
                    value={tempValue}
                    onChange={handleFieldChange}
                    onBlur={() => handleFieldBlur('dateOfBirth')}
                    onKeyDown={(e) => handleKeyPress(e, 'dateOfBirth')}
                    className={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <div 
                    className={styles.fieldValue}
                    onClick={() => handleFieldClick('dateOfBirth')}
                  >
                    {new Date(formData.dateOfBirth).toLocaleDateString('vi-VN')}
                    <span className={styles.editIcon}>✏️</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Địa chỉ</label>
              {editingField === 'address' ? (
                <textarea
                  value={tempValue}
                  onChange={handleFieldChange}
                  onBlur={() => handleFieldBlur('address')}
                  onKeyDown={(e) => handleKeyPress(e, 'address')}
                  className={styles.editTextarea}
                  rows="3"
                  autoFocus
                />
              ) : (
                <div 
                  className={styles.fieldValue}
                  onClick={() => handleFieldClick('address')}
                >
                  {formData.address}
                  <span className={styles.editIcon}>✏️</span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Liên hệ khẩn cấp</label>
              {editingField === 'emergencyContact' ? (
                <input
                  type="tel"
                  value={tempValue}
                  onChange={handleFieldChange}
                  onBlur={() => handleFieldBlur('emergencyContact')}
                  onKeyDown={(e) => handleKeyPress(e, 'emergencyContact')}
                  className={styles.editInput}
                  autoFocus
                />
              ) : (
                <div 
                  className={styles.fieldValue}
                  onClick={() => handleFieldClick('emergencyContact')}
                >
                  {formData.emergencyContact}
                  <span className={styles.editIcon}>✏️</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfile;
