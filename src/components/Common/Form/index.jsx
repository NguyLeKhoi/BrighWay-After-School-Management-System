import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styles from './Form.module.css';

const Form = ({
  schema,
  defaultValues = {},
  onSubmit,
  submitText = 'Submit',
  loading = false,
  fields = [],
  children,
  className = '',
  error = '',
  showReset = true,
  resetText = 'Reset'
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field) => {
    const { name, label, type = 'text', options = [], ...fieldProps } = field;
    const error = errors[name];

    return (
      <div key={name} className={`${styles.formGroup} ${field.fullWidth ? styles.fullWidth : ''}`}>
        <label htmlFor={name} className={styles.formLabel}>
          {label}
        </label>
        
        {type === 'textarea' ? (
          <textarea
            {...register(name)}
            id={name}
            name={name}
            className={styles.formInput}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 4}
          />
        ) : type === 'select' ? (
          <select
            {...register(name)}
            id={name}
            name={name}
            className={styles.formInput}
            required={field.required}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'checkbox' ? (
          <div className={styles.checkboxGroup}>
            <input
              {...register(name)}
              type="checkbox"
              id={name}
              name={name}
              className={styles.checkbox}
            />
            <label htmlFor={name} className={styles.checkboxLabel}>
              {label}
            </label>
          </div>
        ) : (
          <input
            {...register(name)}
            type={type}
            id={name}
            name={name}
            className={styles.formInput}
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
        
        {error && (
          <div className={styles.errorMessage}>
            {error.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`${styles.form} ${className}`}>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <div className={styles.formFields}>
        {fields.map(renderField)}
      </div>
      
      {children}
      
      <div className={styles.buttonGroup}>
        {showReset && (
          <button
            type="button"
            className={`${styles.submitButton} ${styles.resetButton}`}
            onClick={() => reset()}
            disabled={isSubmitting || loading}
          >
            {resetText}
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? 'Loading...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default Form;
