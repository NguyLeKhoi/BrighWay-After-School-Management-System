import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
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
      startDate: '2024-01-15',
      endDate: '2024-06-15',
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
      startDate: '2024-01-20',
      endDate: '2024-05-20',
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
    // Handle course registration
  };

  const handleCancelCourse = (courseId) => {
    const course = registeredCourses.find(c => c.id === courseId);
    setCourseToCancel(course);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    console.log('Confirm cancel course:', courseToCancel?.id);
    // Handle course cancellation logic here
    setCancelDialogOpen(false);
    setCourseToCancel(null);
    // Show success message
    alert(`Đã hủy đăng ký khóa học "${courseToCancel?.name}" thành công!`);
  };

  const handleCancelDialog = () => {
    setCancelDialogOpen(false);
    setCourseToCancel(null);
  };

  return (
    <div className={styles.coursesPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Khóa học của tôi</h1>
        
        {/* Tabs */}
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'registered' ? styles.active : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            Đã đăng ký ({registeredCourses.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'available' ? styles.active : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Có thể đăng ký ({availableCourses.length})
          </button>
        </div>

        {/* Registered Courses */}
        {activeTab === 'registered' && (
          <div className={styles.coursesSection}>
            {registeredCourses.length > 0 ? (
              <div className={styles.coursesGrid}>
                {registeredCourses.map((course) => (
                  <div key={course.id} className={styles.courseCard}>
                    <div className={styles.courseHeader}>
                      <h3 className={styles.courseName}>{course.name}</h3>
                      <span className={`${styles.statusBadge} ${styles[course.status]}`}>
                        {course.status === 'active' ? 'Đang học' : 'Tạm dừng'}
                      </span>
                    </div>
                    
                    <div className={styles.courseInfo}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Con:</span>
                        <span className={styles.infoValue}>{course.childName}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Giáo viên:</span>
                        <span className={styles.infoValue}>{course.teacher}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Lịch học:</span>
                        <span className={styles.infoValue}>{course.schedule}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Phòng:</span>
                        <span className={styles.infoValue}>{course.room}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Học phí:</span>
                        <span className={styles.infoValue}>{formatCurrency(course.price)}</span>
                      </div>
                    </div>

                    <div className={styles.courseActions}>
                      <button 
                        className={styles.cancelRegistrationButton}
                        onClick={() => handleCancelCourse(course.id)}
                      >
                        Hủy đăng ký
                      </button>
                    </div>
                  </div>
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
                <div key={course.id} className={styles.availableCourseCard}>
                  <div className={styles.courseHeader}>
                    <h3 className={styles.courseName}>{course.name}</h3>
                    <span className={styles.priceTag}>
                      {formatCurrency(course.price)}
                    </span>
                  </div>
                  
                  <p className={styles.courseDescription}>
                    {course.description}
                  </p>
                  
                  <div className={styles.courseInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Độ tuổi:</span>
                      <span className={styles.infoValue}>{course.ageGroup}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Lịch học:</span>
                      <span className={styles.infoValue}>{course.schedule}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Thời gian:</span>
                      <span className={styles.infoValue}>{course.duration}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Còn lại:</span>
                      <span className={styles.infoValue}>
                        {course.spotsLeft} chỗ
                      </span>
                    </div>
                  </div>

                  <div className={styles.courseActions}>
                    <button 
                      className={styles.registerButton}
                      onClick={() => handleRegisterCourse(course.id)}
                    >
                      Đăng ký ngay
                    </button>
                    <button className={styles.detailsButton}>
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Course Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={handleCancelDialog}
          aria-labelledby="cancel-dialog-title"
          aria-describedby="cancel-dialog-description"
        >
          <DialogTitle id="cancel-dialog-title">
            Xác nhận hủy đăng ký
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="cancel-dialog-description">
              Bạn có chắc chắn muốn hủy đăng ký khóa học <strong>"{courseToCancel?.name}"</strong> không?
              <br /><br />
              <span style={{ color: '#d32f2f', fontSize: '14px' }}>
                ⚠️ Hành động này không thể hoàn tác. Học phí đã đóng có thể không được hoàn lại tùy theo chính sách của trung tâm.
              </span>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCancelDialog}
              color="primary"
              variant="outlined"
            >
              Không hủy
            </Button>
            <Button 
              onClick={handleConfirmCancel}
              color="error"
              variant="contained"
              autoFocus
            >
              Có, hủy đăng ký
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default MyCourses;
