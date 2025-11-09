import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid, Switch, FormControlLabel, Box, Typography } from '@mui/material';
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
    reset,
    control,
    watch
  } = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues
  });

  const handleFormSubmit = async (data) => {
    console.log('Form - handleFormSubmit called with data:', data);
    try {
      await onSubmit(data);
      console.log('Form - onSubmit completed successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      throw error; // Re-throw to let form handle it
    }
  };

  const renderField = (field) => {
    const { name, label, type = 'text', options = [], className = '', ...fieldProps } = field;
    const error = errors[name];

    return (
      <div className={`${styles.formGroup} ${field.fullWidth ? styles.fullWidth : ''} ${className ? styles[className] : ''}`}>
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
            {...fieldProps}
          />
        ) : type === 'select' ? (
          <select
            {...register(name)}
            id={name}
            name={name}
            className={styles.formInput}
            required={field.required}
            {...fieldProps}
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
              {...fieldProps}
            />
            <label htmlFor={name} className={styles.checkboxLabel}>
              {label}
            </label>
          </div>
        ) : type === 'switch' ? (
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {label}:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: value ? 'success.main' : 'text.disabled',
                      fontWeight: 'medium'
                    }}
                  >
                    {value ? 'Hoạt động' : 'Không hoạt động'}
                  </Typography>
                  <Switch
                    checked={value || false}
                    onChange={onChange}
                    color="primary"
                    sx={{
                      '& .MuiSwitch-thumb': {
                        backgroundColor: value ? '#4caf50' : '#f5f5f5'
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: value ? '#81c784' : '#e0e0e0'
                      }
                    }}
                    {...fieldProps}
                  />
                </Box>
              </Box>
            )}
          />
        ) : (
          <input
            {...register(name)}
            type={type}
            id={name}
            name={name}
            className={styles.formInput}
            placeholder={field.placeholder}
            required={field.required}
            {...fieldProps}
          />
        )}
        
        {field.helperText && (
          <div className={styles.helperText}>
            {field.helperText}
          </div>
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
        <Grid container spacing={2}>
          {(() => {
            let currentSection = '';
            return fields.map((field, index) => {
              const elements = [];
              if (field.section && field.section !== currentSection) {
                currentSection = field.section;
                elements.push(
                  <Grid item xs={12} key={`section-${currentSection}-${index}`}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTitle}>{field.section}</div>
                      {field.sectionDescription && (
                        <div className={styles.sectionDescription}>{field.sectionDescription}</div>
                      )}
                    </div>
                  </Grid>
                );
              }

              elements.push(
                <Grid item xs={field.gridSize || 12} key={field.name || index}>
                  {renderField(field)}
                </Grid>
              );

              return (
                <React.Fragment key={`field-${field.name || index}`}>
                  {elements}
                </React.Fragment>
              );
            });
          })()}
        </Grid>
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
