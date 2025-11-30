import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Form from '@components/Common/Form';
import PageTransition from '@components/Common/PageTransition';
import contactService from '../../../services/contact.service';
import { contactRequestSchema } from '../../../utils/validationSchemas/contactSchemas';
import styles from './Contact.module.css';

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formValues) => {
    if (loading) return false;
    
    try {
      setLoading(true);
      
      // Map form values to API payload
      const payload = {
        parentName: formValues.parentName,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        childrenAgeRange: formValues.childrenAgeRange || '',
        message: formValues.message
      };
      
      await contactService.submitContactRequest(payload);
      
      toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.', {
        position: 'top-right',
        autoClose: 5000
      });
      
      // Reset form by returning true (Form component will handle reset)
      return true;
    } catch (error) {
      const errorMessage = error?.message || error?.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại sau.';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { 
      name: 'parentName', 
      label: 'Họ và Tên Phụ Huynh', 
      type: 'text', 
      required: true, 
      placeholder: 'Nhập họ và tên của bạn',
      gridSize: 12
    },
    { 
      name: 'email', 
      label: 'Email', 
      type: 'email', 
      required: true, 
      placeholder: 'example@email.com',
      gridSize: 6
    },
    { 
      name: 'phoneNumber', 
      label: 'Số Điện Thoại', 
      type: 'tel', 
      required: true, 
      placeholder: '0900 123 456',
      gridSize: 6
    },
    { 
      name: 'childrenAgeRange', 
      label: 'Độ Tuổi Của Trẻ', 
      type: 'text', 
      placeholder: 'Ví dụ: 5-7 tuổi (nếu có nhiều trẻ, vui lòng ghi rõ)',
      gridSize: 12
    },
    { 
      name: 'message', 
      label: 'Nội Dung Yêu Cầu', 
      type: 'textarea', 
      required: true, 
      rows: 6, 
      placeholder: 'Vui lòng cho chúng tôi biết nhu cầu của bạn về dịch vụ giữ trẻ, gói dịch vụ quan tâm, hoặc bất kỳ câu hỏi nào bạn muốn được tư vấn...',
      gridSize: 12
    }
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
                  Hãy liên hệ với BRIGHTWAY ngay hôm nay! Đội ngũ của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn 
                  tìm được giải pháp phù hợp nhất cho con em của bạn.
                </p>
                
                <Form
                  schema={contactRequestSchema}
                  defaultValues={{
                    parentName: '',
                    email: '',
                    phoneNumber: '',
                    childrenAgeRange: '',
                    message: ''
                  }}
                  fields={formFields}
                  onSubmit={handleSubmit}
                  submitText="Gửi Tin Nhắn"
                  loading={loading}
                  disabled={loading}
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
                  src="/images/6.jpg" 
                  alt="Liên hệ BRIGHTWAY - Dịch vụ giữ trẻ an toàn và chất lượng"
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
