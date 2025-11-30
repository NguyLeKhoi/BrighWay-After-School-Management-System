import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@components/Common/HeroSection';
import ContentSection from '@components/Common/ContentSection';
import styles from './Homepage.module.css';

const Homepage = () => {
  const features = ['Chăm Sóc Chuyên Nghiệp', 'Hoạt Động Đa Dạng', 'Cơ Sở Vật Chất An Toàn'];

  // Ảnh section 1 - nhân viên chăm sóc và trẻ em
  const section1Image = (
    <img 
      src="/images/1.png" 
      alt="Nhân viên chăm sóc và trẻ em"
      className={styles.contentImage}
    />
  );

  // Ảnh section 2 - môi trường chăm sóc trẻ
  const section2Image = (
    <img 
      src="/images/2.png" 
      alt="Môi trường chăm sóc trẻ an toàn và hiện đại"
      className={styles.contentImage}
    />
  );

  const contentSection1 = {
    heading: 'Về BRIGHTWAY',
    subheading: 'Nơi giữ trẻ an toàn và tin cậy',
    description: 'BRIGHTWAY là dịch vụ giữ trẻ sau giờ học với các hoạt động ngoài giờ đa dạng, phong phú. Chúng tôi cam kết mang đến môi trường an toàn, vui vẻ và bổ ích cho trẻ em với đội ngũ nhân viên chăm sóc chuyên nghiệp và cơ sở vật chất hiện đại.',
    features: features,
    hasImage: true,
    imageContent: section1Image
  };

  const contentSection2 = {
    heading: 'Tại Sao Chọn Chúng Tôi',
    subheading: 'Cam kết chất lượng chăm sóc trẻ',
    description: 'Chúng tôi cung cấp dịch vụ giữ trẻ chất lượng cao với các hoạt động ngoài giờ đa dạng, được thiết kế để trẻ em phát triển toàn diện về thể chất, tinh thần và kỹ năng xã hội trong môi trường an toàn và vui vẻ.',
    hasImage: true,
    reverse: true,
    imageContent: section2Image
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

  return (
    <motion.div 
      className={styles.homepage}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <HeroSection
          title="BRIGHTWAY - After School Management"
          subtitle="Nơi giữ trẻ an toàn với các hoạt động ngoài giờ phong phú và bổ ích"
          hasImage={false}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ContentSection {...contentSection1} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ContentSection {...contentSection2} />
      </motion.div>
    </motion.div>
  );
};

export default Homepage;