import React, { useState } from 'react';
import Form from '@components/Common/Form';
import InfoGrid from '@components/Common/InfoGrid';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    childAge: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission
  };

  const formFields = [
    { name: 'name', label: 'Họ và Tên Phụ Huynh', type: 'text', value: formData.name, onChange: handleChange, required: true, placeholder: 'Nhập họ và tên của bạn' },
    { name: 'email', label: 'Email', type: 'email', value: formData.email, onChange: handleChange, required: true, placeholder: 'example@email.com' },
    { name: 'phone', label: 'Số Điện Thoại', type: 'tel', value: formData.phone, onChange: handleChange, required: true, placeholder: '0900 123 456' },
    { name: 'childAge', label: 'Độ Tuổi Của Trẻ', type: 'text', value: formData.childAge, onChange: handleChange, placeholder: 'Ví dụ: 5-7 tuổi (nếu có nhiều trẻ, vui lòng ghi rõ)' },
    { name: 'message', label: 'Nội Dung Yêu Cầu', type: 'textarea', value: formData.message, onChange: handleChange, required: true, rows: 6, placeholder: 'Vui lòng cho chúng tôi biết nhu cầu của bạn về dịch vụ giữ trẻ, gói dịch vụ quan tâm, hoặc bất kỳ câu hỏi nào bạn muốn được tư vấn...' }
  ];

  const contactInfo = [
    { label: 'Hệ Thống Chi Nhánh', value: 'Nhiều chi nhánh trên toàn quốc - Liên hệ để biết chi nhánh gần nhất' },
    { label: 'Điện Thoại', value: '1900 1234' },
    { label: 'Email', value: 'info@brighway.com' },
    { label: 'Giờ Làm Việc', value: 'Thứ 2 - Thứ 6: 7:00 - 18:00' },
    { label: 'Website', value: 'www.brighway.com' },
    { label: 'Mạng Xã Hội', value: 'Facebook, Zalo, Instagram' }
  ];

  return (
    <div className={styles.contact}>
      <section className={styles.contactFormSection}>
        <div className={styles.contactContainer}>
          <div className={styles.formWrapper}>
            <div className={styles.formContent}>
              <h1 className={styles.contactTitle}>Liên Hệ Với Chúng Tôi</h1>
              <p className={styles.contactSubtitle}>
                Bạn đang tìm kiếm dịch vụ giữ trẻ chất lượng với các hoạt động ngoài giờ phong phú? 
                Hãy liên hệ với BRIGHWAY ngay hôm nay! Đội ngũ của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn 
                tìm được giải pháp phù hợp nhất cho con em của bạn.
              </p>
              
              <Form
                fields={formFields}
                onSubmit={handleSubmit}
                submitText="Gửi Tin Nhắn"
                className={styles.contactForm}
              />
            </div>
            
            <div className={styles.imageContent}>
              <img 
                src={import.meta.env.VITE_IMAGE_CONTACT || ''} 
                alt="Liên hệ BRIGHWAY - Dịch vụ giữ trẻ an toàn và chất lượng"
                className={styles.contactImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.informationSection}>
        <div className={styles.informationContainer}>
          <InfoGrid items={contactInfo} columns={3} />
        </div>
      </section>
    </div>
  );
};

export default Contact;
