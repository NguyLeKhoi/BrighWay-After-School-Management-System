import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@components/Common/HeroSection';
import Card from '@components/Common/Card';
import ContentLoading from '@components/Common/ContentLoading';
import packageService from '../../../services/package.service';
import { useApp } from '../../../contexts/AppContext';
import styles from './PackageCatalog.module.css';

const PackageCatalog = () => {
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
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách gói dịch vụ. Vui lòng thử lại sau.';
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
      title: pkg.name || 'Gói dịch vụ',
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
              window.location.href = '/user/services';
            } else {
              window.location.href = '/login';
            }
          }
        }
      ]
    };
  };

  // Giới hạn số lượng packages hiển thị
  const MAX_PACKAGES_DISPLAY = 6; // Tổng số packages tối đa hiển thị
  const MAX_FEATURED_PACKAGES = 3; // Số packages ở section giữa
  
  const bestPackages = packages.slice(0, MAX_PACKAGES_DISPLAY).map(formatPackageToCard);
  const featuredPackages = packages.slice(0, MAX_FEATURED_PACKAGES).map(formatPackageToCard);

  // Ảnh hero - gói học
  const heroImage = (
    <img 
      src="/images/3.jpg" 
      alt="Các gói dịch vụ giữ trẻ tại BRIGHWAY"
      className={styles.heroImageImg}
    />
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div 
      className={styles.packageCatalog}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <HeroSection
          title="Danh Mục Gói Dịch Vụ"
          subtitle="Khám phá các gói dịch vụ giữ trẻ với hoạt động ngoài giờ đa dạng"
          hasImage={true}
          imageContent={heroImage}
        />
      </motion.div>

      {/* Article Section */}
      <motion.section 
        className={styles.contentSection}
        variants={itemVariants}
      >
        <div className={styles.contentContainer}>
          <article className={styles.article}>
            <motion.p 
              className={styles.articleText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Chào mừng bạn đến với danh mục gói dịch vụ của BRIGHWAY! Chúng tôi cung cấp các gói dịch vụ giữ trẻ đa dạng, 
              được thiết kế phù hợp với từng độ tuổi và nhu cầu của trẻ em. Mỗi gói dịch vụ bao gồm các hoạt động ngoài giờ 
              phong phú, giúp trẻ phát triển toàn diện về thể chất, tinh thần và kỹ năng xã hội trong môi trường an toàn và vui vẻ.
            </motion.p>
            
            {loading ? (
              <ContentLoading text="Đang tải danh sách gói dịch vụ..." />
            ) : featuredPackages.length > 0 ? (
              <motion.div 
                className={styles.cardGrid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {featuredPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      title={pkg.title}
                      description={pkg.description}
                      infoRows={pkg.infoRows}
                      actions={pkg.actions}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <div className={styles.cardPlaceholder}>Chưa có gói dịch vụ nào</div>
                </div>
              </div>
            )}

            <motion.p 
              className={styles.articleText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Tất cả các gói dịch vụ của chúng tôi đều được quản lý bởi đội ngũ nhân viên chăm sóc trẻ chuyên nghiệp, 
              giàu kinh nghiệm. Các hoạt động được thiết kế đa dạng, từ vui chơi, thể thao, nghệ thuật đến các hoạt động 
              phát triển kỹ năng. Chúng tôi cam kết mang đến môi trường an toàn, vui vẻ và bổ ích cho trẻ em.
            </motion.p>
          </article>
        </div>
      </motion.section>

      {/* Best Packages Section */}
      <motion.section 
        className={styles.bestPackagesSection}
        variants={itemVariants}
      >
        <div className={styles.bestPackagesContainer}>
          <motion.h2 
            className={styles.sectionHeading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Các Gói Dịch Vụ Nổi Bật
          </motion.h2>
          {loading ? (
              <ContentLoading text="Đang tải danh sách gói dịch vụ..." />
            ) : bestPackages.length > 0 ? (
            <motion.div 
              className={styles.bestPackagesGrid}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {bestPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    title={pkg.title}
                    description={pkg.description}
                    infoRows={pkg.infoRows}
                    actions={pkg.actions}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Hiện tại chưa có gói dịch vụ nào. Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default PackageCatalog;

