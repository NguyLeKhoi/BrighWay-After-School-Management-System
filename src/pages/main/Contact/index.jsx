import React, { useState } from 'react';
import Form from '@components/Common/Form';
import InfoGrid from '@components/Common/InfoGrid';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
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
    console.log('Form submitted:', formData);
  };

  const formFields = [
    { name: 'name', label: 'Name', type: 'text', value: formData.name, onChange: handleChange, required: true },
    { name: 'email', label: 'Email', type: 'email', value: formData.email, onChange: handleChange, required: true },
    { name: 'phone', label: 'Phone', type: 'tel', value: formData.phone, onChange: handleChange },
    { name: 'company', label: 'Company', type: 'text', value: formData.company, onChange: handleChange },
    { name: 'message', label: 'Message', type: 'textarea', value: formData.message, onChange: handleChange, required: true, rows: 6 }
  ];

  const contactInfo = [
    { label: 'Address', value: '123 Education Street, Learning City' },
    { label: 'Phone', value: '+1 (555) 123-4567' },
    { label: 'Email', value: 'info@education.com' },
    { label: 'Hours', value: 'Mon-Fri: 9AM-6PM' },
    { label: 'Website', value: 'www.education.com' },
    { label: 'Social', value: '@education_center' }
  ];

  return (
    <div className={styles.contact}>
      <section className={styles.contactFormSection}>
        <div className={styles.contactContainer}>
          <div className={styles.formWrapper}>
            <div className={styles.formContent}>
              <h1 className={styles.contactTitle}>Get in touch</h1>
              <p className={styles.contactSubtitle}>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              
              <Form
                fields={formFields}
                onSubmit={handleSubmit}
                submitText="Send message"
                className={styles.contactForm}
              />
            </div>
            
            <div className={styles.imageContent}>
              <div className={styles.imagePlaceholder}>Image</div>
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
