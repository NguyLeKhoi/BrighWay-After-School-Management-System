import React, { useState, useEffect } from 'react';
import styles from './EditableField.module.css';

const EditableField = ({ 
  label, 
  value, 
  type = 'text',
  onSave,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  // Sync tempValue with value prop changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleFieldClick = () => {
    setIsEditing(true);
    setTempValue(value);
  };

  const handleFieldChange = (e) => {
    setTempValue(e.target.value);
  };

  const handleFieldBlur = () => {
    if (onSave) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (onSave) {
        onSave(tempValue);
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label className={styles.label}>{label}</label>
      {isEditing ? (
        type === 'textarea' ? (
          <textarea
            value={tempValue}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            onKeyDown={handleKeyPress}
            className={styles.editTextarea}
            autoFocus
            rows={4}
          />
        ) : (
          <input
            type={type}
            value={tempValue}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            onKeyDown={handleKeyPress}
            className={styles.editInput}
            autoFocus
          />
        )
      ) : (
        <div 
          className={styles.fieldValue}
          onClick={handleFieldClick}
        >
          {type === 'date' && value ? new Date(value).toLocaleDateString('vi-VN') : value}
          <span className={styles.editIcon}>✏️</span>
        </div>
      )}
    </div>
  );
};

export default EditableField;

