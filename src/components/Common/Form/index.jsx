import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid, Switch, Box, Typography, TextField, Checkbox, InputAdornment, IconButton, ListItemText } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import styles from './Form.module.css';

// Password field component with show/hide toggle
const PasswordField = ({ name, control, placeholder, required, error, disabled, fieldProps }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field: controllerField }) => (
        <div style={{ position: 'relative', width: '100%' }}>
          <input
          {...controllerField}
          type={showPassword ? 'text' : 'password'}
          id={name}
            name={name}
            className={styles.formInput}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
            value={controllerField.value || ''}
            style={{
              paddingRight: '45px'
            }}
            {...fieldProps}
          />
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
            disabled={disabled}
            sx={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '4px',
              color: 'var(--text-secondary)',
              '&:hover': {
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary)'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
                >
            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
        </div>
      )}
    />
  );
};

const Form = forwardRef(({
  schema,
  defaultValues = {},
  onSubmit,
  submitText = 'Submit',
  loading = false,
  fields = [],
  children,
  className = '',
  error = '',
  hideSubmitButton = false
}, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    trigger,
    getValues,
    setValue
  } = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange'
  });

  const previousErrorMessages = useRef({});

  // Reset form when defaultValues change (for update scenarios)
  // Use a ref to track previous defaultValues to avoid unnecessary resets
  const prevDefaultValuesRef = useRef(defaultValues);
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      // Skip on initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        prevDefaultValuesRef.current = defaultValues;
        return;
      }
      
      const prev = prevDefaultValuesRef.current || {};
      const current = defaultValues || {};
      
      // Check if only file fields (avatarFile, image) changed
      const nonFileKeys = Object.keys(current).filter(key => key !== 'avatarFile' && key !== 'image');
      const onlyFileFieldsChanged = nonFileKeys.every(key => {
        return prev[key] === current[key];
      }) && (
        (prev.avatarFile !== current.avatarFile) || 
        (prev.image !== current.image)
      );
      
      if (onlyFileFieldsChanged) {
        // Only update file fields without resetting the form
        if (current.avatarFile !== undefined && formRef.current?.setValue) {
          formRef.current.setValue('avatarFile', current.avatarFile, { shouldValidate: false });
        }
        if (current.image !== undefined && formRef.current?.setValue) {
          formRef.current.setValue('image', current.image, { shouldValidate: false });
        }
      } else {
        // Other fields changed, reset form
      reset(defaultValues, { keepDefaultValues: true });
      }
      
      prevDefaultValuesRef.current = defaultValues;
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    const nextErrorMessages = {};
    Object.entries(errors).forEach(([fieldName, errorValue]) => {
      const message = errorValue?.message;
      if (message) {
        nextErrorMessages[fieldName] = message;
      }
    });
    previousErrorMessages.current = nextErrorMessages;
  }, [errors]);

  const formElementRef = useRef(null);

  const handleFormSubmit = async (data) => {
    try {
      // Note: Validation is already done in submit() function before calling this
      // Just call onSubmit callback
      const result = await onSubmit(data);
      previousErrorMessages.current = {};
      return result !== false; // Return true if result is not false
    } catch (error) {
      console.error('Form submission error:', error);
      return false; // Return false on error
    }
  };

  // Expose submit function via ref
  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (formElementRef.current) {
        // First validate the form - trigger validation for all fields
        try {
          const isValid = await trigger();
          
          if (!isValid) {
            // Validation failed, don't submit
            return false;
          }
          
          // If validation passes, get values and submit
          const values = getValues();
          const result = await handleFormSubmit(values);
          
          // Return true only if submit was successful
          return result !== false;
        } catch (error) {
          console.error('Form submit error:', error);
          return false;
        }
      }
      return false;
    },
    validate: async () => {
      return await trigger();
    },
    getValues: () => getValues(),
    setValue: (name, value, options) => {
      setValue(name, value, options);
    }
  }));

  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      options = [],
      className = '',
      helperText,
      fullWidth,
      section, // Remove from fieldProps
      sectionDescription, // Remove from fieldProps
      gridSize, // Remove from fieldProps
      ...fieldProps
    } = field;
    const error = errors[name];

    let inputElement;
    if (type === 'textarea') {
      inputElement = (
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
      );
    } else if (type === 'select') {
      inputElement = (
        <Controller
          name={name}
          control={control}
          render={({ field: controllerField }) => {
            const handleChange = (_, newValue) => {
              controllerField.onChange(newValue?.value || '');
            };
            const selectedOption = options.find(
              (option) => {
                // Handle both string and number comparison
                const optionValue = String(option.value);
                const fieldValue = String(controllerField.value);
                return optionValue === fieldValue;
              }
            ) || null;
            return (
              <Autocomplete
                disableClearable={!field.allowClear}
                options={options || []}
                value={selectedOption}
                onChange={handleChange}
                getOptionLabel={(option) => {
                  if (!option || typeof option !== 'object') return '';
                  return option.label || '';
                }}
                filterOptions={(x) => x}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <Box component="li" {...optionProps} key={key} sx={{ py: 1.5 }}>
                      {option.description ? (
                        <ListItemText
                          primary={option.label}
                          secondary={option.description}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.75rem',
                            color: 'text.secondary'
                          }}
                        />
                      ) : (
                        <Typography variant="body2">{option.label}</Typography>
                      )}
                    </Box>
                  );
                }}
                renderInput={(params) => {
                  // Ưu tiên helperText của field, nếu không có thì hiển thị description của option đã chọn
                  const displayHelperText = field.helperText || (selectedOption?.description || undefined);
                  return (
                    <TextField
                      {...params}
                      placeholder={field.placeholder}
                      size="small"
                      disabled={field.disabled}
                      helperText={displayHelperText}
                      FormHelperTextProps={{
                        sx: {
                          marginTop: 0.5,
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  // Handle both string and number comparison
                  return String(option.value) === String(value.value);
                }}
                disabled={field.disabled}
                loading={field.loading}
                noOptionsText={options.length === 0 ? 'Không có dữ liệu' : 'Không tìm thấy'}
                openOnFocus
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: '8px'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-light)'
                  }
                }}
                {...fieldProps}
              />
            );
          }}
        />
      );
    } else if (type === 'multiselect') {
      const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
      const checkedIcon = <CheckBoxIcon fontSize="small" />;
      inputElement = (
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => {
            const normalizedValue = Array.isArray(value)
              ? value
              : value
              ? [value]
              : [];
            const selectedOptions = options.filter((option) =>
              normalizedValue.includes(option.value)
            );
            return (
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={options}
                value={selectedOptions}
                onChange={(_, newValue) => onChange(newValue.map((option) => option.value))}
                getOptionLabel={(option) => option.label || ''}
                renderOption={(props, option, { selected }) => (
                  (() => {
                    const { key, ...optionProps } = props;
                    return (
                      <li {...optionProps} key={key}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.label}
                      </li>
                    );
                  })()
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={field.placeholder || 'Chọn lợi ích'}
                    size="small"
                  />
                )}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: '8px',
                    paddingY: '2px'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-light)'
                  }
                }}
                {...fieldProps}
              />
            );
          }}
        />
      );
    } else if (type === 'checkbox') {
      inputElement = (
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
      );
    } else if (type === 'switch') {
      inputElement = (
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
                      backgroundColor: value ? 'var(--color-success)' : 'var(--bg-secondary)'
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: value ? 'var(--color-success-light)' : 'var(--border-light)'
                    }
                  }}
                  {...fieldProps}
                />
              </Box>
            </Box>
          )}
        />
      );
    } else if (type === 'password') {
      // Password field with show/hide toggle
      inputElement = (
        <PasswordField
          name={name}
          control={control}
          placeholder={field.placeholder}
          required={field.required}
          error={error}
          disabled={field.disabled}
          fieldProps={fieldProps}
        />
      );
    } else if (type === 'file') {
      inputElement = (
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange } }) => (
            <Box>
              <input
                type="file"
                accept={fieldProps.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onChange(file);
                }}
                disabled={field.disabled}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                {...fieldProps}
              />
              {helperText && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {helperText}
                </Typography>
              )}
            </Box>
          )}
        />
      );
    } else {
      inputElement = (
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
      );
    }

    const fieldContent = (
      <div className={styles.inputWrapper}>
        {inputElement}
        {helperText && <div className={styles.helperText}>{helperText}</div>}
        {error && <div className={styles.errorMessage}>{error.message}</div>}
      </div>
    );

    return (
      <div className={`${styles.formGroup} ${fullWidth ? styles.fullWidth : ''} ${className ? styles[className] : ''}`}>
        <label htmlFor={name} className={styles.formLabel}>
          {label}
        </label>
        {fieldContent}
      </div>
    );
  };

  return (
    <form 
      ref={formElementRef}
      onSubmit={handleSubmit(handleFormSubmit)} 
      className={`${styles.form} ${className}`}
    >
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <div className={styles.formFields}>
        <Grid container spacing={1.5}>
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
      
      {!hideSubmitButton && (
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Loading...' : submitText}
          </button>
        </div>
      )}
    </form>
  );
});

Form.displayName = 'Form';

export default Form;
