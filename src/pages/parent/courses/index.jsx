import React, { useState } from 'react';
import Tabs from '@components/Common/Tabs';
import Card from '@components/Common/Card';
import ConfirmDialog from '@components/Common/ConfirmDialog';
import styles from './Courses.module.css';

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState('registered');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [courseToCancel, setCourseToCancel] = useState(null);
  
  const [registeredCourses] = useState([
    {
      id: 1,
      name: 'Toán học nâng cao',
      childName: 'Nguyễn Văn B',
      teacher: 'Cô Minh',
      schedule: 'Thứ 2, 4, 6 - 14:00-15:30',
      room: 'Phòng 201',
      status: 'active',
      price: 1500000
    },
    {
      id: 2,
      name: 'Tiếng Anh giao tiếp',
      childName: 'Nguyễn Thị C',
      teacher: 'Thầy John',
      schedule: 'Thứ 3, 5 - 16:00-17:30',
      room: 'Phòng 105',
      status: 'active',
      price: 1200000
    }
  ]);

  const [availableCourses] = useState([
    {
      id: 3,
      name: 'Khoa học thực hành',
      description: 'Khóa học thực hành các thí nghiệm khoa học cơ bản',
      ageGroup: '8-12 tuổi',
      schedule: 'Thứ 7 - 09:00-11:00',
      price: 800000,
      duration: '3 tháng',
      spotsLeft: 5
    },
    {
      id: 4,
      name: 'Vẽ và Mỹ thuật',
      description: 'Phát triển khả năng sáng tạo và nghệ thuật',
      ageGroup: '6-10 tuổi',
      schedule: 'Chủ nhật - 14:00-16:00',
      price: 600000,
      duration: '2 tháng',
      spotsLeft: 8
    },
    {
      id: 5,
      name: 'Lập trình Scratch',
      description: 'Học lập trình cơ bản với Scratch',
      ageGroup: '9-13 tuổi',
      schedule: 'Thứ 2, 4 - 15:00-16:30',
      price: 1000000,
      duration: '4 tháng',
      spotsLeft: 3
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleRegisterCourse = (courseId) => {
    console.log('Register course:', courseId);
  };

  const handleCancelCourse = (courseId) => {
    const course = registeredCourses.find(c => c.id === courseId);
    setCourseToCancel(course);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    console.log('Confirm cancel course:', courseToCancel?.id);
    setCancelDialogOpen(false);
    setCourseToCancel(null);
    alert(`Đã hủy đăng ký khóa học "${courseToCancel?.name}" thành công!`);
  };

  const handleCancelDialog = () => {
    setCancelDialogOpen(false);
    setCourseToCancel(null);
  };

  const tabs = [
    { id: 'registered', label: `Đã đăng ký (${registeredCourses.length})` },
    { id: 'available', label: `Có thể đăng ký (${availableCourses.length})` }
  ];

  return (
    <div className={styles.coursesPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Khóa học của tôi</h1>
        
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Registered Courses */}
        {activeTab === 'registered' && (
          <div className={styles.coursesSection}>
            {registeredCourses.length > 0 ? (
              <div className={styles.coursesGrid}>
                {registeredCourses.map((course) => (
                  <Card
                    key={course.id}
                    title={course.name}
                    status={{ text: course.status === 'active' ? 'Đang học' : 'Tạm dừng', type: course.status }}
                    infoRows={[
                      { label: 'Con', value: course.childName },
                      { label: 'Giáo viên', value: course.teacher },
                      { label: 'Lịch học', value: course.schedule },
                      { label: 'Phòng', value: course.room },
                      { label: 'Học phí', value: formatCurrency(course.price) }
                    ]}
                    actions={[
                      { text: 'Hủy đăng ký', primary: false, onClick: () => handleCancelCourse(course.id) }
                    ]}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📚</div>
                <h3>Chưa đăng ký khóa học nào</h3>
                <p>Hãy xem các khóa học có sẵn và đăng ký cho con bạn</p>
                <button 
                  className={styles.browseButton}
                  onClick={() => setActiveTab('available')}
                >
                  Xem khóa học
                </button>
              </div>
            )}
          </div>
        )}

        {/* Available Courses */}
        {activeTab === 'available' && (
          <div className={styles.coursesSection}>
            <div className={styles.coursesGrid}>
              {availableCourses.map((course) => (
                <Card
                  key={course.id}
                  title={course.name}
                  description={course.description}
                  badges={[{ text: formatCurrency(course.price), type: 'price' }]}
                  infoRows={[
                    { label: 'Độ tuổi', value: course.ageGroup },
                    { label: 'Lịch học', value: course.schedule },
                    { label: 'Thời gian', value: course.duration },
                    { label: 'Còn lại', value: `${course.spotsLeft} chỗ` }
                  ]}
                  actions={[
                    { text: 'Đăng ký ngay', primary: true, onClick: () => handleRegisterCourse(course.id) },
                    { text: 'Chi tiết', primary: false, onClick: () => console.log('View details:', course.id) }
                  ]}
                />
              ))}
            </div>
          </div>
        )}

        <ConfirmDialog
          open={cancelDialogOpen}
          onClose={handleCancelDialog}
          onConfirm={handleConfirmCancel}
          title="Xác nhận hủy đăng ký"
          description={`Bạn có chắc chắn muốn hủy đăng ký khóa học "${courseToCancel?.name}" không?\n\n⚠️ Hành động này không thể hoàn tác. Học phí đã đóng có thể không được hoàn lại tùy theo chính sách của trung tâm.`}
          confirmText="Có, hủy đăng ký"
          cancelText="Không hủy"
          confirmColor="error"
        />
      </div>
    </div>
  );
};

export default MyCourses;
