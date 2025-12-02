import { describe, it, expect } from 'vitest';
import {
  formatErrorMessage,
  getErrorMessage,
  getFieldErrors
} from '../errorHandler';

describe('errorHandler', () => {
  describe('formatErrorMessage', () => {
    it('should return default message for null or undefined', () => {
      expect(formatErrorMessage(null)).toBe('Có lỗi xảy ra');
      expect(formatErrorMessage(undefined)).toBe('Có lỗi xảy ra');
    });

    it('should return detail field if present', () => {
      const errorResponse = {
        data: {
          detail: 'Image validation failed'
        }
      };
      expect(formatErrorMessage(errorResponse)).toBe('Image validation failed');
    });

    it('should return message field if detail is not present', () => {
      const errorResponse = {
        data: {
          message: 'Something went wrong'
        }
      };
      expect(formatErrorMessage(errorResponse)).toBe('Something went wrong');
    });

    it('should format validation errors from errors object', () => {
      const errorResponse = {
        data: {
          errors: {
            'Email': ['Email is required', 'Email must be valid'],
            'Password': ['Password must be at least 8 characters']
          }
        }
      };
      const result = formatErrorMessage(errorResponse);
      expect(result).toContain('Email: Email is required');
      expect(result).toContain('Mật khẩu: Password must be at least 8 characters');
    });

    it('should handle single string error in errors object', () => {
      const errorResponse = {
        data: {
          errors: {
            'Email': 'Email is required'
          }
        }
      };
      const result = formatErrorMessage(errorResponse);
      expect(result).toContain('Email: Email is required');
    });

    it('should return title if present and no other fields', () => {
      const errorResponse = {
        data: {
          title: 'Validation Error'
        }
      };
      expect(formatErrorMessage(errorResponse)).toBe('Validation Error');
    });

    it('should return statusText as fallback', () => {
      const errorResponse = {
        data: {
          statusText: 'Bad Request'
        }
      };
      expect(formatErrorMessage(errorResponse)).toBe('Bad Request');
    });

    it('should return default message if no error fields present', () => {
      const errorResponse = {
        data: {}
      };
      expect(formatErrorMessage(errorResponse)).toBe('Có lỗi xảy ra');
    });
  });

  describe('getErrorMessage', () => {
    it('should return default message for null or undefined', () => {
      expect(getErrorMessage(null)).toBe('Có lỗi xảy ra');
      expect(getErrorMessage(undefined)).toBe('Có lỗi xảy ra');
    });

    it('should handle axios error with response', () => {
      const axiosError = {
        response: {
          data: {
            message: 'API Error'
          }
        }
      };
      expect(getErrorMessage(axiosError)).toBe('API Error');
    });

    it('should handle regular error with message', () => {
      const error = new Error('Network error');
      expect(getErrorMessage(error)).toBe('Network error');
    });

    it('should return default message if error has no message', () => {
      const error = {};
      expect(getErrorMessage(error)).toBe('Có lỗi xảy ra');
    });
  });

  describe('getFieldErrors', () => {
    it('should return empty object for null or undefined', () => {
      expect(getFieldErrors(null)).toEqual({});
      expect(getFieldErrors(undefined)).toEqual({});
    });

    it('should return empty object if no data', () => {
      const errorResponse = {};
      expect(getFieldErrors(errorResponse)).toEqual({});
    });

    it('should extract field errors and convert to camelCase', () => {
      const errorResponse = {
        data: {
          errors: {
            'Email': ['Email is required'],
            'Password': ['Password is too short'],
            'PhoneNumber': ['Invalid phone number']
          }
        }
      };
      const result = getFieldErrors(errorResponse);
      expect(result.email).toBe('Email is required');
      expect(result.password).toBe('Password is too short');
      expect(result.phoneNumber).toBe('Invalid phone number');
    });

    it('should handle string errors in errors object', () => {
      const errorResponse = {
        data: {
          errors: {
            'Email': 'Email is required'
          }
        }
      };
      const result = getFieldErrors(errorResponse);
      expect(result.email).toBe('Email is required');
    });

    it('should take first message from array', () => {
      const errorResponse = {
        data: {
          errors: {
            'Email': ['First error', 'Second error']
          }
        }
      };
      const result = getFieldErrors(errorResponse);
      expect(result.email).toBe('First error');
    });

    it('should return empty object if no errors field', () => {
      const errorResponse = {
        data: {
          message: 'General error'
        }
      };
      expect(getFieldErrors(errorResponse)).toEqual({});
    });
  });
});

