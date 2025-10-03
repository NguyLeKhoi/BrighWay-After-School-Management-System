import React, { useState } from 'react';
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
        <input
          type={type}
          value={tempValue}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          onKeyDown={handleKeyPress}
          className={styles.editInput}
          autoFocus
        />
      ) : (
        <div 
          className={styles.fieldValue}
          onClick={handleFieldClick}
        >
          {type === 'date' ? new Date(value).toLocaleDateString('vi-VN') : value}
          <span className={styles.editIcon}>✏️</span>
        </div>
      )}
    </div>
  );
};

export default EditableField;

