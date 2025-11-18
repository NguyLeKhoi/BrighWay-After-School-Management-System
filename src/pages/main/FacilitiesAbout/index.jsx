import React, { useState, useEffect } from 'react';
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

  // Ảnh section 1 - cơ sở vật chất (phòng học, thư viện, khu vui chơi)
  const facilitiesImage = (
    <img 
      src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop&q=80" 
      alt="Cơ sở vật chất hiện đại - Phòng học và không gian học tập"
      className={styles.contentImage}
    />
  );

  // Ảnh section 2 - về chúng tôi (môi trường học tập, thiết bị)
  const aboutImage = (
    <img 
      src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop&q=80" 
      alt="Môi trường học tập với thiết bị hiện đại"
      className={styles.contentImage}
    />
  );

  const facilitiesSection = {
    heading: 'Cơ Sở Vật Chất Của Chúng Tôi',
    subheading: 'Môi trường học tập đẳng cấp thế giới',
    description: 'Chúng tôi tự hào về hệ thống cơ sở vật chất hiện đại, được trang bị đầy đủ thiết bị và công nghệ tiên tiến để mang đến trải nghiệm học tập tốt nhất cho học sinh.',
    hasImage: true,
    imageContent: facilitiesImage
  };

  const aboutSection = {
    heading: 'Về Chúng Tôi',
    subheading: 'Cam kết với sự xuất sắc trong giáo dục',
    description: 'Với nhiều năm kinh nghiệm trong lĩnh vực giáo dục, chúng tôi luôn đặt chất lượng và sự phát triển của học sinh lên hàng đầu. Đội ngũ giáo viên của chúng tôi được tuyển chọn kỹ lưỡng và thường xuyên được đào tạo nâng cao.',
    hasImage: true,
    reverse: true,
    imageContent: aboutImage
  };

  const missionData = {
    heading: 'Sứ Mệnh Của Chúng Tôi',
    description: 'BRIGHWAY cam kết mang đến môi trường học tập tốt nhất cho học sinh, với đội ngũ giáo viên chuyên nghiệp, cơ sở vật chất hiện đại và phương pháp giảng dạy tiên tiến. Chúng tôi tin rằng mỗi học sinh đều có tiềm năng phát triển và chúng tôi sẽ đồng hành cùng các em trên con đường học tập.',
    hasImage: false
  };

  return (
    <div className={styles.facilitiesAbout}>
      <ContentSection {...facilitiesSection} />
      <ContentSection {...aboutSection} />
      <ContentSection {...missionData} />
      
      {/* Facilities List Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <h2 className={styles.sectionHeading}>Danh Sách Cơ Sở Vật Chất</h2>
          {loading ? (
            <ContentLoading text="Đang tải thông tin cơ sở vật chất..." />
          ) : facilities.length > 0 ? (
            <div className={styles.facilitiesGrid}>
              {facilities.slice(0, MAX_FACILITIES_DISPLAY).map((facility) => (
                <Card
                  key={facility.id}
                  title={facility.facilityName || 'Cơ sở vật chất'}
                  description={facility.description || 'Không có mô tả'}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Hiện tại chưa có cơ sở vật chất nào. Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FacilitiesAbout;
