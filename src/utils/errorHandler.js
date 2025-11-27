/**
 * Error Handler Utility
 * Formats error messages from backend API responses
 */

/**
 * Maps field names from backend (PascalCase) to frontend (camelCase) for display
 */
const fieldNameMap = {
  'Password': 'Mật khẩu',
  'Name': 'Họ và tên',
  'Email': 'Email',
  'PhoneNumber': 'Số điện thoại',
  'Phone': 'Số điện thoại',
  'BranchId': 'Chi nhánh',
  'StudentRela': 'Mối quan hệ',
  'AvatarFile': 'Ảnh đại diện',
  'IsActive': 'Trạng thái'
};

/**
 * Formats validation errors from backend into user-friendly messages
 * @param {Object} errorResponse - The error response from axios
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (errorResponse) => {
  if (!errorResponse) return 'Có lỗi xảy ra';

  const data = errorResponse.data || errorResponse;
  
  // Priority 1: Check for detail field (usually contains specific error messages like image validation)
  if (data.detail) {
    return data.detail;
  }
  
  // Priority 2: Check for direct message
  if (data.message) {
    return data.message;
  }

  // Handle validation errors (400 Bad Request with errors object)
  if (data.errors && typeof data.errors === 'object') {
    const errorMessages = [];
    
    Object.entries(data.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        const fieldDisplayName = fieldNameMap[field] || field;
        messages.forEach(msg => {
          errorMessages.push(`${fieldDisplayName}: ${msg}`);
        });
      } else if (typeof messages === 'string') {
        const fieldDisplayName = fieldNameMap[field] || field;
        errorMessages.push(`${fieldDisplayName}: ${messages}`);
      }
    });

    if (errorMessages.length > 0) {
      return errorMessages.join('\n');
    }
  }

  // Handle title from validation errors
  if (data.title) {
    return data.title;
  }

  // Fallback to status text or generic message
  return data.statusText || 'Có lỗi xảy ra';
};

/**
 * Extracts error message from error object (axios error or regular error)
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Có lỗi xảy ra';

  // Handle axios errors
  if (error.response) {
    return formatErrorMessage(error.response);
  }

  // Handle regular errors
  if (error.message) {
    return error.message;
  }

  return 'Có lỗi xảy ra';
};

/**
 * Gets validation errors for specific fields (useful for form field errors)
 * @param {Object} errorResponse - The error response from axios
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const getFieldErrors = (errorResponse) => {
  const fieldErrors = {};
  
  if (!errorResponse || !errorResponse.data) {
    return fieldErrors;
  }

  const data = errorResponse.data;
  
  if (data.errors && typeof data.errors === 'object') {
    Object.entries(data.errors).forEach(([field, messages]) => {
      // Convert PascalCase to camelCase for frontend
      const camelCaseField = field.charAt(0).toLowerCase() + field.slice(1);
      
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[camelCaseField] = messages[0]; // Take first message
      } else if (typeof messages === 'string') {
        fieldErrors[camelCaseField] = messages;
      }
    });
  }

  return fieldErrors;
};

