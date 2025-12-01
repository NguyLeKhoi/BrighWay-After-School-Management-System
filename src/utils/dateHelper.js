/**
 * Date Helper Utility
 * Handles date parsing and formatting with UTC+7 timezone (Vietnam timezone)
 * Backend uses UTC+7, so we need to parse dates correctly to avoid timezone issues
 */

/**
 * Parse date string from backend (UTC+7) to local Date object
 * Backend returns dates in UTC+7 format, we need to handle this correctly
 * @param {string|Date} dateValue - Date string from API or Date object
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export const parseDateFromUTC7 = (dateValue) => {
  if (!dateValue) return null;

  // If already a Date object, return as is
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  // If it's a string, parse it
  if (typeof dateValue === 'string') {
    // Check if it's an ISO string with timezone info
    if (dateValue.includes('T') || dateValue.includes('Z') || dateValue.includes('+')) {
      // Parse ISO string - if it has timezone offset, use it
      // If it's UTC (Z), treat it as UTC+7 by adjusting
      let dateStr = dateValue;
      
      // If ends with Z (UTC), we need to add 7 hours to get UTC+7
      if (dateValue.endsWith('Z')) {
        const utcDate = new Date(dateValue);
        // Add 7 hours to convert from UTC to UTC+7
        const utcPlus7Date = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
        return utcPlus7Date;
      }
      
      // If has timezone offset like +07:00, parse normally
      // If no timezone, assume it's already in UTC+7
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    // Simple date string (YYYY-MM-DD), parse as local date
    const parts = dateValue.split('T')[0].split(' ')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  return null;
};

/**
 * Format date string from backend to YYYY-MM-DD format (UTC+7)
 * Extracts only the date part, ignoring timezone conversion issues
 * @param {string|Date} dateValue - Date string from API or Date object
 * @returns {string|null} Date string in YYYY-MM-DD format or null
 */
export const extractDateString = (dateValue) => {
  if (!dateValue) return null;

  if (typeof dateValue === 'string') {
    // Extract date part before T or space
    const dateStr = dateValue.split('T')[0].split(' ')[0];
    // Validate format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
  }

  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return null;
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
};

/**
 * Format date to Vietnamese locale string with UTC+7 timezone
 * @param {string|Date} dateValue - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateUTC7 = (dateValue, options = {}) => {
  const date = parseDateFromUTC7(dateValue);
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh', // UTC+7
    ...options
  };

  return date.toLocaleString('vi-VN', defaultOptions);
};

/**
 * Format date only (without time) to Vietnamese locale
 * @param {string|Date} dateValue - Date to format
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export const formatDateOnlyUTC7 = (dateValue, options = {}) => {
  const date = parseDateFromUTC7(dateValue);
  if (!date) return '';

  const defaultOptions = {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };

  return date.toLocaleDateString('vi-VN', defaultOptions);
};

/**
 * Format datetime to Vietnamese locale with time
 * @param {string|Date} dateValue - Date to format
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted datetime string
 */
export const formatDateTimeUTC7 = (dateValue, options = {}) => {
  const date = parseDateFromUTC7(dateValue);
  if (!date) return '';

  const defaultOptions = {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  };

  return date.toLocaleString('vi-VN', defaultOptions);
};

/**
 * Get current time in UTC+7 (Vietnam timezone)
 * Returns milliseconds since epoch for current UTC+7 time
 * @returns {number} Current UTC+7 time in milliseconds
 */
export const getCurrentTimeUTC7 = () => {
  const now = new Date();
  // Get current UTC time
  const utcNow = now.getTime();
  // Get timezone offset in minutes
  const localOffset = now.getTimezoneOffset(); // in minutes
  // UTC+7 offset is -420 minutes (7 hours * 60 minutes)
  const utc7Offset = -420;
  // Calculate UTC+7 time
  const utc7Time = utcNow + (localOffset - utc7Offset) * 60 * 1000;
  return utc7Time;
};

/**
 * Parse date string as UTC+7 and return as Date object
 * If timestamp has no timezone, treat it as UTC+7
 * @param {string|Date} dateValue - Date string from API or Date object
 * @returns {Date|null} Date object
 */
export const parseAsUTC7 = (dateValue) => {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  if (typeof dateValue === 'string') {
    // If has timezone indicator (Z, +07:00, etc.), parse normally
    if (dateValue.includes('Z') || dateValue.match(/[+-]\d{2}:\d{2}$/)) {
      return new Date(dateValue);
    } else {
      // No timezone indicator - assume it's UTC+7
      // Parse the ISO string and treat it as UTC+7 by appending +07:00
      // Extract date parts
      const match = dateValue.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/);
      if (match) {
        const [, year, month, day, hour, minute, second, millisecond] = match;
        // Create ISO string with UTC+7 timezone
        const ms = millisecond ? `.${millisecond.substring(0, 3)}` : '';
        const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}${ms}+07:00`;
        return new Date(isoString);
      }
      // Fallback: try parsing as is
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
};

/**
 * Format Date object to ISO string with UTC+7 timezone for backend
 * This ensures the date sent to backend maintains the same day regardless of browser timezone
 * @param {Date} date - Date object to format
 * @returns {string} ISO string with +07:00 timezone (e.g., "2025-12-01T08:00:00+07:00")
 */
export const formatDateToUTC7ISO = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  // Get date components in local time (as user sees them)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  // Format as ISO string with UTC+7 timezone
  // Backend will parse this and check DayOfWeek in UTC+7
  // By formatting with the date components as the user sees them and adding +07:00,
  // we ensure the backend receives the date in UTC+7 timezone, preserving the weekday
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+07:00`;
};

