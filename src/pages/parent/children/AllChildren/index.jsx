import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@components/Common/Card';
import Form from '@components/Common/Form';
import { childSchema } from '../../../../utils/validationSchemas';
import { useApp } from '../../../../contexts/AppContext';
import styles from './Children.module.css';

const ChildrenList = () => {
  const { addNotification } = useApp();
  
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

  const handleAddChild = (data) => {
    const child = {
      id: Date.now(),
      name: data.name,
      age: parseInt(data.age),
      grade: data.grade,
      avatar: data.name.split(' ').map(n => n[0]).join(''),
      membershipType: 'Chưa có',
      status: 'pending'
    };
    setChildren([...children, child]);
    setShowAddForm(false);
    
    addNotification({
      message: 'Thêm con thành công!',
      severity: 'success'
    });
  };

  // Fields will be auto-generated from childSchema

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

        <div className={styles.childrenGrid}>
          {children.map((child) => (
            <Card
              key={child.id}
              title={child.name}
              subtitle={`${child.age} tuổi • ${child.grade}`}
              avatar={child.avatar}
              badges={[
                { text: child.membershipType, type: child.membershipType.toLowerCase().replace('-', '') }
              ]}
              status={{ text: child.status === 'active' ? 'Hoạt động' : 'Chờ duyệt', type: child.status }}
              actions={[
                { text: 'Xem Profile', primary: false, onClick: () => window.location.href = `/parent/children/${child.id}/profile` },
                { text: 'Lịch học', primary: true, onClick: () => window.location.href = `/parent/children/${child.id}/schedule` }
              ]}
            />
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
