import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Form from '@components/Common/Form';
import InfoGrid from '@components/Common/InfoGrid';
import PageTransition from '@components/Common/PageTransition';
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

  return (
    <PageTransition>
      <div className={styles.contact}>
        <section className={styles.contactFormSection}>
          <div className={styles.contactContainer}>
            <motion.div 
              className={styles.formWrapper}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className={styles.formContent}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
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
              </motion.div>
              
              <motion.div 
                className={styles.imageContent}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <img 
                  src={import.meta.env.VITE_IMAGE_CONTACT || ''} 
                  alt="Liên hệ BRIGHWAY - Dịch vụ giữ trẻ an toàn và chất lượng"
                  className={styles.contactImage}
                />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Contact;
