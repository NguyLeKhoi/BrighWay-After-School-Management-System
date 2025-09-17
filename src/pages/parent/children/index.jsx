import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Children.module.css';

const ChildrenList = () => {
  const [children, setChildren] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn B',
      age: 8,
      grade: 'Lớp 3',
      avatar: 'NV',
      membershipType: 'Full-Week',
      status: 'active'
    },
    {
      id: 2,
      name: 'Nguyễn Thị C',
      age: 10,
      grade: 'Lớp 5',
      avatar: 'NT',
      membershipType: 'Even-Day',
      status: 'active'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newChild, setNewChild] = useState({
    name: '',
    age: '',
    grade: '',
    dateOfBirth: '',
    gender: 'male'
  });

  const handleAddChild = (e) => {
    e.preventDefault();
    const child = {
      id: Date.now(),
      name: newChild.name,
      age: parseInt(newChild.age),
      grade: newChild.grade,
      avatar: newChild.name.split(' ').map(n => n[0]).join(''),
      membershipType: 'Chưa có',
      status: 'pending'
    };
    setChildren([...children, child]);
    setNewChild({ name: '', age: '', grade: '', dateOfBirth: '', gender: 'male' });
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChild({
      ...newChild,
      [name]: value
    });
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
            <form onSubmit={handleAddChild}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tên con</label>
                  <input
                    type="text"
                    name="name"
                    value={newChild.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tuổi</label>
                  <input
                    type="number"
                    name="age"
                    value={newChild.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Lớp</label>
                  <input
                    type="text"
                    name="grade"
                    value={newChild.grade}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Lớp 3"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Giới tính</label>
                  <select
                    name="gender"
                    value={newChild.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={newChild.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.saveButton}>
                  Lưu
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowAddForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.childrenGrid}>
          {children.map((child) => (
            <div key={child.id} className={styles.childCard}>
              <div className={styles.childAvatar}>
                <span>{child.avatar}</span>
              </div>
              <div className={styles.childInfo}>
                <h3 className={styles.childName}>{child.name}</h3>
                <p className={styles.childDetails}>
                  {child.age} tuổi • {child.grade}
                </p>
                <div className={styles.membership}>
                  <span className={`${styles.membershipBadge} ${styles[child.membershipType.toLowerCase().replace('-', '')]}`}>
                    {child.membershipType}
                  </span>
                </div>
                <div className={styles.status}>
                  <span className={`${styles.statusBadge} ${styles[child.status]}`}>
                    {child.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                  </span>
                </div>
              </div>
              <div className={styles.childActions}>
                <Link to={`/parent/children/${child.id}`} className={styles.viewButton}>
                  Xem chi tiết
                </Link>
                <button className={styles.editButton}>
                  Chỉnh sửa
                </button>
              </div>
            </div>
          ))}
        </div>

        {children.length === 0 && (
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
      </div>
    </div>
  );
};

export default ChildrenList;
