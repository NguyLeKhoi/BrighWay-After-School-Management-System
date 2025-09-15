import React, { useState } from 'react';
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
    // Handle form submission
    console.log('Form submitted:', formData);
  };

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
      {/* Contact Form Section */}
      <section className={styles.contactFormSection}>
        <div className={styles.contactContainer}>
          <div className={styles.formWrapper}>
            <div className={styles.formContent}>
              <h1 className={styles.contactTitle}>Get in touch</h1>
              <p className={styles.contactSubtitle}>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.formLabel}>Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="company" className={styles.formLabel}>Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    rows="6"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  Send message
                </button>
              </form>
            </div>
            
            <div className={styles.imageContent}>
              <div className={styles.imagePlaceholder}>Image</div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className={styles.informationSection}>
        <div className={styles.informationContainer}>
          <div className={styles.infoGrid}>
            {contactInfo.map((info, index) => (
              <div key={index} className={styles.infoItem}>
                <div className={styles.infoLabel}>{info.label}</div>
                <div className={styles.infoValue}>{info.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
