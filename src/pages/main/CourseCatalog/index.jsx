import React, { useState, useEffect } from 'react';
import HeroSection from '@components/Common/HeroSection';
import Card from '@components/Common/Card';
import ContentLoading from '@components/Common/ContentLoading';
import packageService from '../../../services/package.service';
import { useApp } from '../../../contexts/AppContext';
import styles from './CourseCatalog.module.css';

const CourseCatalog = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showGlobalError } = useApp();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        // Fetch packages from public endpoint (no authentication required)
        const response = await packageService.getPublicPackages();
        
        // Handle both array and object responses
        const packagesData = Array.isArray(response) ? response : (response.items || []);
        setPackages(packagesData);
      } catch (error) {
        console.error('Error fetching packages:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách gói học. Vui lòng thử lại sau.';
        showGlobalError(errorMessage);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [showGlobalError]);

  // Format price to VND
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format duration
  const formatDuration = (months) => {
    if (!months) return 'N/A';
    return `${months} tháng`;
  };

  // Convert package data to card format
  const formatPackageToCard = (pkg) => {
    const infoRows = [];
    
    if (pkg.studentLevel?.name) {
      infoRows.push({ label: 'Cấp độ', value: pkg.studentLevel.name });
    }
    
    if (pkg.durationInMonths) {
      infoRows.push({ label: 'Thời gian', value: formatDuration(pkg.durationInMonths) });
    }
    
    if (pkg.totalSlots) {
      infoRows.push({ label: 'Số buổi', value: `${pkg.totalSlots} buổi` });
    }
    
    if (pkg.price) {
      infoRows.push({ label: 'Giá', value: formatPrice(pkg.price) });
    }

    if (pkg.branch?.name) {
      infoRows.push({ label: 'Chi nhánh', value: pkg.branch.name });
    }

    return {
      id: pkg.id,
      title: pkg.name || 'Gói học',
      description: pkg.desc || 'Không có mô tả',
      infoRows: infoRows,
      actions: [
        { 
          text: 'Đăng ký', 
          primary: true, 
          onClick: () => {
            // Redirect to login if not authenticated, or to family/services
            const user = localStorage.getItem('user');
            if (user) {
              window.location.href = '/family/services';
            } else {
              window.location.href = '/login';
            }
          }
        },
        { 
          text: 'Xem chi tiết', 
          primary: false, 
          onClick: () => {
            // Could navigate to package detail page if exists
            console.log('View package details:', pkg.id);
          }
        }
      ]
    };
  };

  // Giới hạn số lượng packages hiển thị
  const MAX_PACKAGES_DISPLAY = 6; // Tổng số packages tối đa hiển thị
  const MAX_FEATURED_PACKAGES = 3; // Số packages ở section giữa
  
  const bestCourses = packages.slice(0, MAX_PACKAGES_DISPLAY).map(formatPackageToCard);
  const featuredPackages = packages.slice(0, MAX_FEATURED_PACKAGES).map(formatPackageToCard);

  // Ảnh hero - khóa học và gói học
  const heroImage = (
    <img 
      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop&q=80" 
      alt="Các gói học tại BRIGHWAY"
      className={styles.heroImageImg}
    />
  );

  return (
    <div className={styles.courseCatalog}>
      <HeroSection
        title="Danh Mục Gói Học"
        subtitle="Khám phá các chương trình học tập toàn diện của chúng tôi"
        hasImage={true}
        imageContent={heroImage}
      />

      {/* Article Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <article className={styles.article}>
            <p className={styles.articleText}>
              Chào mừng bạn đến với danh mục gói học của BRIGHWAY! Chúng tôi cung cấp các gói học tập đa dạng, 
              được thiết kế phù hợp với từng cấp độ và nhu cầu học tập của học sinh. Mỗi gói học được xây dựng 
              với mục tiêu giúp học sinh phát triển toàn diện về kiến thức, kỹ năng và tư duy.
            </p>
            
            {loading ? (
              <ContentLoading text="Đang tải danh sách gói học..." />
            ) : featuredPackages.length > 0 ? (
              <div className={styles.cardGrid}>
                {featuredPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    title={pkg.title}
                    description={pkg.description}
                    infoRows={pkg.infoRows}
                    actions={pkg.actions}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <div className={styles.cardPlaceholder}>Chưa có gói học nào</div>
                </div>
              </div>
            )}

            <p className={styles.articleText}>
              Tất cả các gói học của chúng tôi đều được giảng dạy bởi đội ngũ giáo viên giàu kinh nghiệm, 
              sử dụng phương pháp giảng dạy hiện đại và tài liệu học tập được cập nhật thường xuyên. 
              Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho học sinh.
            </p>
          </article>
        </div>
      </section>

      {/* Best Courses Section */}
      <section className={styles.bestCoursesSection}>
        <div className={styles.bestCoursesContainer}>
          <h2 className={styles.sectionHeading}>Các Gói Học Nổi Bật</h2>
          {loading ? (
            <ContentLoading text="Đang tải danh sách gói học..." />
          ) : bestCourses.length > 0 ? (
            <div className={styles.bestCoursesGrid}>
              {bestCourses.map((course) => (
                <Card
                  key={course.id}
                  title={course.title}
                  description={course.description}
                  infoRows={course.infoRows}
                  actions={course.actions}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Hiện tại chưa có gói học nào. Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseCatalog;
