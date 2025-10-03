import React from 'react';
import styles from './Form.module.css';

const Form = ({ 
  fields, 
  onSubmit, 
  submitText = 'Submit',
  isLoading = false,
  error = '',
  className = '',
  children 
}) => {
  return (
    <form onSubmit={onSubmit} className={`${styles.form} ${className}`}>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <div className={styles.formFields}>
        {fields.map((field) => (
          <div key={field.name} className={`${styles.formGroup} ${field.fullWidth ? styles.fullWidth : ''}`}>
            <label htmlFor={field.name} className={styles.formLabel}>
              {field.label}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                className={styles.formInput}
                placeholder={field.placeholder}
                required={field.required}
                rows={field.rows || 4}
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                className={styles.formInput}
                required={field.required}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  checked={field.value}
                  onChange={field.onChange}
                  className={styles.checkbox}
                />
                <label htmlFor={field.name} className={styles.checkboxLabel}>
                  {field.label}
                </label>
              </div>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                className={styles.formInput}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
      
      {children}
      
      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : submitText}
      </button>
    </form>
  );
};

export default Form;

