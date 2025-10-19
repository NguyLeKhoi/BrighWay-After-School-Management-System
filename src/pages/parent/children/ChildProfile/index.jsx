import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ChildProfile.module.css';

const ChildProfile = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Mock data - trong thực tế sẽ fetch từ API
  const mockChildren = [
    {
      id: 1,
      name: 'Nguyễn Văn B',
      age: 8,
      grade: 'Lớp 3',
      avatar: 'NV',
      membershipType: 'Full-Week',
      status: 'active',
      dateOfBirth: '2015-05-15',
      gender: 'male',
      phone: '0123456789',
      email: 'child1@example.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      emergencyContact: 'Nguyễn Thị A - 0987654321',
      medicalInfo: 'Không có dị ứng',
      school: 'Trường Tiểu học ABC'
    },
    {
      id: 2,
      name: 'Nguyễn Thị C',
      age: 10,
      grade: 'Lớp 5',
      avatar: 'NT',
      membershipType: 'Even-Day',
      status: 'active',
      dateOfBirth: '2013-08-20',
      gender: 'female',
      phone: '0123456790',
      email: 'child2@example.com',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      emergencyContact: 'Nguyễn Văn B - 0987654322',
      medicalInfo: 'Dị ứng với hải sản',
      school: 'Trường Tiểu học XYZ'
    }
  ];

  useEffect(() => {
    // Tìm thông tin con từ mock data
    const foundChild = mockChildren.find(c => c.id === parseInt(childId));
    if (foundChild) {
      setChild(foundChild);
    } else {
      navigate('/parent/children');
    }
  }, [childId, navigate]);

  const handleFieldClick = (fieldName) => {
    setEditingField(fieldName);
    setTempValue(child[fieldName]);
  };

  const handleFieldChange = (e) => {
    setTempValue(e.target.value);
  };

  const handleFieldBlur = (fieldName) => {
    setChild({
      ...child,
      [fieldName]: tempValue
    });
    setEditingField(null);
    setTempValue('');
    // Handle profile update
    console.log('Field updated:', fieldName, tempValue);
  };

  const handleKeyPress = (e, fieldName) => {
    if (e.key === 'Enter') {
      setChild({
        ...child,
        [fieldName]: tempValue
      });
      setEditingField(null);
      setTempValue('');
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
  };

  const handleBack = () => {
    navigate('/parent/children');
  };

  if (!child) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Quay lại
          </button>
          <h1 className={styles.title}>Profile của {child.name}</h1>
          <p className={styles.subtitle}>Click vào field để chỉnh sửa</p>
        </div>

        {/* Profile Content */}
        <div className={styles.profileContent}>

          {/* Profile Form */}
          <div className={styles.profileCard}>
            <div className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ và tên</label>
                  {editingField === 'name' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={handleFieldChange}
                      onBlur={() => handleFieldBlur('name')}
                      onKeyDown={(e) => handleKeyPress(e, 'name')}
                      className={styles.editInput}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className={styles.fieldValue}
                      onClick={() => handleFieldClick('name')}
                    >
                      {child.name}
                      <span className={styles.editIcon}>✏️</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tuổi</label>
                  {editingField === 'age' ? (
                    <input
                      type="number"
                      value={tempValue}
                      onChange={handleFieldChange}
                      onBlur={() => handleFieldBlur('age')}
                      onKeyDown={(e) => handleKeyPress(e, 'age')}
                      className={styles.editInput}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className={styles.fieldValue}
                      onClick={() => handleFieldClick('age')}
                    >
                      {child.age}
                      <span className={styles.editIcon}>✏️</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Lớp</label>
                  {editingField === 'grade' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={handleFieldChange}
                      onBlur={() => handleFieldBlur('grade')}
                      onKeyDown={(e) => handleKeyPress(e, 'grade')}
                      className={styles.editInput}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className={styles.fieldValue}
                      onClick={() => handleFieldClick('grade')}
                    >
                      {child.grade}
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
                      {new Date(child.dateOfBirth).toLocaleDateString('vi-VN')}
                      <span className={styles.editIcon}>✏️</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giới tính</label>
                  {editingField === 'gender' ? (
                    <select
                      value={tempValue}
                      onChange={handleFieldChange}
                      onBlur={() => handleFieldBlur('gender')}
                      onKeyDown={(e) => handleKeyPress(e, 'gender')}
                      className={styles.editInput}
                      autoFocus
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  ) : (
                    <div 
                      className={styles.fieldValue}
                      onClick={() => handleFieldClick('gender')}
                    >
                      {child.gender === 'male' ? 'Nam' : 'Nữ'}
                      <span className={styles.editIcon}>✏️</span>
                    </div>
                  )}
                </div>
                
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
                      {child.phone}
                      <span className={styles.editIcon}>✏️</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
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
                      {child.email}
                      <span className={styles.editIcon}>✏️</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Trường học</label>
                  {editingField === 'school' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={handleFieldChange}
                      onBlur={() => handleFieldBlur('school')}
                      onKeyDown={(e) => handleKeyPress(e, 'school')}
                      className={styles.editInput}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className={styles.fieldValue}
                      onClick={() => handleFieldClick('school')}
                    >
                      {child.school}
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
                    {child.address}
                    <span className={styles.editIcon}>✏️</span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Medical Information */}
          <div className={styles.profileCard}>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Thông tin sức khỏe / Dị ứng</label>
                {editingField === 'medicalInfo' ? (
                  <textarea
                    value={tempValue}
                    onChange={handleFieldChange}
                    onBlur={() => handleFieldBlur('medicalInfo')}
                    onKeyDown={(e) => handleKeyPress(e, 'medicalInfo')}
                    className={styles.editTextarea}
                    rows="3"
                    placeholder="Ví dụ: Dị ứng với hải sản, hen suyễn..."
                    autoFocus
                  />
                ) : (
                  <div 
                    className={styles.fieldValue}
                    onClick={() => handleFieldClick('medicalInfo')}
                  >
                    {child.medicalInfo || 'Chưa có thông tin'}
                    <span className={styles.editIcon}>✏️</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChildProfile;
