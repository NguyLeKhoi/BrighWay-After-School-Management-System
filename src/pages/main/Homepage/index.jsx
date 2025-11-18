import React from 'react';
import HeroSection from '@components/Common/HeroSection';
import ContentSection from '@components/Common/ContentSection';
import styles from './Homepage.module.css';

const Homepage = () => {
  const features = ['Giáo Dục Chất Lượng', 'Giáo Viên Chuyên Nghiệp', 'Cơ Sở Vật Chất Hiện Đại'];

  // Ảnh hero - học sinh vui vẻ học tập
  const heroImage = (
    <img 
      src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=600&fit=crop&q=80" 
      alt="Học sinh học tập tại BRIGHWAY"
      className={styles.heroImageImg}
    />
  );

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
    subheading: 'Nơi nuôi dưỡng tài năng trẻ',
    description: 'Chúng tôi cam kết mang đến môi trường học tập tốt nhất với đội ngũ giáo viên giàu kinh nghiệm và phương pháp giảng dạy hiện đại.',
    features: features,
    buttons: [
      { text: 'Tìm hiểu thêm', primary: true, onClick: () => {} },
      { text: 'Xem khóa học', primary: false, onClick: () => window.location.href = '/courses' }
    ],
    hasImage: true,
    imageContent: section1Image
  };

  const contentSection2 = {
    heading: 'Tại Sao Chọn Chúng Tôi',
    subheading: 'Cam kết chất lượng giáo dục',
    description: 'Chúng tôi cung cấp các chương trình giáo dục toàn diện được thiết kế để giúp học sinh đạt được mục tiêu và xây dựng tương lai thành công.',
    buttons: [
      { text: 'Xem chương trình', primary: true, onClick: () => window.location.href = '/courses' },
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
        subtitle="Khám phá cơ hội giáo dục tuyệt vời và biến đổi tương lai của con bạn"
        buttonText="Bắt Đầu Ngay"
        onButtonClick={() => window.location.href = '/courses'}
        hasImage={true}
        imageContent={heroImage}
      />

      <ContentSection {...contentSection1} />

      <ContentSection {...contentSection2} />
    </div>
  );
};

export default Homepage;