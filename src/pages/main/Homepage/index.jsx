import React from 'react';
import HeroSection from '@components/Common/HeroSection';
import ContentSection from '@components/Common/ContentSection';
import styles from './Homepage.module.css';

const Homepage = () => {
  const features = ['Chăm Sóc Chuyên Nghiệp', 'Hoạt Động Đa Dạng', 'Cơ Sở Vật Chất An Toàn'];

  // Ảnh section 1 - giáo viên và học sinh
  const section1Image = (
    <img 
      src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop&q=80" 
      alt="Giáo viên và học sinh"
      className={styles.contentImage}
    />
  );

  // Ảnh section 2 - môi trường học tập
  const section2Image = (
    <img 
      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80" 
      alt="Môi trường học tập hiện đại"
      className={styles.contentImage}
    />
  );

  const contentSection1 = {
    heading: 'Về BRIGHWAY',
    subheading: 'Nơi giữ trẻ an toàn và tin cậy',
    description: 'BRIGHWAY là dịch vụ giữ trẻ sau giờ học với các hoạt động ngoài giờ đa dạng, phong phú. Chúng tôi cam kết mang đến môi trường an toàn, vui vẻ và bổ ích cho trẻ em với đội ngũ nhân viên chăm sóc chuyên nghiệp và cơ sở vật chất hiện đại.',
    features: features,
    buttons: [
      { text: 'Tìm hiểu thêm', primary: true, onClick: () => {} },
      { text: 'Xem gói dịch vụ', primary: false, onClick: () => window.location.href = '/packages' }
    ],
    hasImage: true,
    imageContent: section1Image
  };

  const contentSection2 = {
    heading: 'Tại Sao Chọn Chúng Tôi',
    subheading: 'Cam kết chất lượng chăm sóc trẻ',
    description: 'Chúng tôi cung cấp dịch vụ giữ trẻ chất lượng cao với các hoạt động ngoài giờ đa dạng, được thiết kế để trẻ em phát triển toàn diện về thể chất, tinh thần và kỹ năng xã hội trong môi trường an toàn và vui vẻ.',
    buttons: [
      { text: 'Xem gói dịch vụ', primary: true, onClick: () => window.location.href = '/packages' },
      { text: 'Đăng ký ngay', primary: false, onClick: () => window.location.href = '/login' }
    ],
    hasImage: true,
    reverse: true,
    imageContent: section2Image
  };

  return (
    <div className={styles.homepage}>
      <HeroSection
        title="BRIGHWAY - After School Management"
        subtitle="Nơi giữ trẻ an toàn với các hoạt động ngoài giờ phong phú và bổ ích"
        buttonText="Bắt Đầu Ngay"
        onButtonClick={() => window.location.href = '/packages'}
        hasImage={false}
      />

      <ContentSection {...contentSection1} />

      <ContentSection {...contentSection2} />
    </div>
  );
};

export default Homepage;