import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ContentSection from '@components/Common/ContentSection';
import ContentLoading from '@components/Common/ContentLoading';
import Card from '@components/Common/Card';
import facilityService from '../../../services/facility.service';
import { useApp } from '../../../contexts/AppContext';
import styles from './FacilitiesAbout.module.css';

const FacilitiesAbout = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showGlobalError } = useApp();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        // Fetch facilities from public endpoint (no authentication required)
        const response = await facilityService.getPublicFacilities();
        
        // Handle both array and object responses
        const facilitiesData = Array.isArray(response) ? response : (response.items || []);
        setFacilities(facilitiesData);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách cơ sở vật chất. Vui lòng thử lại sau.';
        showGlobalError(errorMessage);
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [showGlobalError]);

  // Giới hạn số lượng facilities hiển thị
  const MAX_FACILITIES_DISPLAY = 6; // Tổng số facilities tối đa hiển thị

  // Ảnh section 1 - cơ sở vật chất (không gian chăm sóc trẻ, khu vui chơi)
  const facilitiesImage = (
    <img 
      src="/images/4.jpg" 
      alt="Cơ sở vật chất hiện đại - Không gian chăm sóc trẻ an toàn"
      className={styles.contentImage}
    />
  );

  // Ảnh section 2 - về chúng tôi (môi trường chăm sóc trẻ, thiết bị)
  const aboutImage = (
    <img 
      src="/images/5.jpg" 
      alt="Môi trường chăm sóc trẻ với thiết bị hiện đại"
      className={styles.contentImage}
    />
  );

  const facilitiesSection = {
    heading: 'Cơ Sở Vật Chất Của Chúng Tôi',
    subheading: 'Môi trường chăm sóc trẻ an toàn và hiện đại',
    description: 'Chúng tôi tự hào về hệ thống cơ sở vật chất hiện đại, được trang bị đầy đủ thiết bị và không gian an toàn để mang đến trải nghiệm chăm sóc tốt nhất cho trẻ em sau giờ học.',
    hasImage: true,
    imageContent: facilitiesImage
  };

  const aboutSection = {
    heading: 'Về Chúng Tôi',
    subheading: 'Cam kết với chất lượng chăm sóc trẻ',
    description: 'Với nhiều năm kinh nghiệm trong lĩnh vực chăm sóc trẻ sau giờ học, chúng tôi luôn đặt chất lượng và sự phát triển của trẻ em lên hàng đầu. Đội ngũ nhân viên chăm sóc của chúng tôi được tuyển chọn kỹ lưỡng và thường xuyên được đào tạo nâng cao.',
    hasImage: true,
    reverse: true,
    imageContent: aboutImage
  };

  const missionData = {
    heading: 'Sứ Mệnh Của Chúng Tôi',
    description: 'BRIGHWAY cam kết mang đến môi trường chăm sóc tốt nhất cho trẻ em sau giờ học, với đội ngũ nhân viên chăm sóc chuyên nghiệp, cơ sở vật chất hiện đại và các hoạt động ngoài giờ đa dạng, phong phú. Chúng tôi tin rằng mỗi trẻ em đều có tiềm năng phát triển và chúng tôi sẽ đồng hành cùng các em trong quá trình phát triển toàn diện.',
    hasImage: false
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
      className={styles.facilitiesAbout}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <ContentSection {...facilitiesSection} />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <ContentSection {...aboutSection} />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <ContentSection {...missionData} />
      </motion.div>
      
      {/* Facilities List Section */}
      <motion.section 
        className={styles.contentSection}
        variants={itemVariants}
      >
        <div className={styles.contentContainer}>
          <motion.h2 
            className={styles.sectionHeading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Danh Sách Cơ Sở Vật Chất
          </motion.h2>
          {loading ? (
            <ContentLoading text="Đang tải thông tin cơ sở vật chất..." />
          ) : facilities.length > 0 ? (
            <motion.div 
              className={styles.facilitiesGrid}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {facilities.slice(0, MAX_FACILITIES_DISPLAY).map((facility) => (
                <motion.div
                  key={facility.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    title={facility.facilityName || 'Cơ sở vật chất'}
                    description={facility.description || 'Không có mô tả'}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Hiện tại chưa có cơ sở vật chất nào. Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default FacilitiesAbout;
