import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  forgotPasswordSchema,
  resetCodeSchema,
  resetPasswordSchema,
  validateEmail,
  validatePhone,
  validatePassword
} from '../authSchemas';

describe('authSchemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject empty email', async () => {
      const invalidData = {
        email: '',
        password: 'password123'
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow('Email là bắt buộc');
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow('Email không hợp lệ');
    });

    it('should reject empty password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow('Mật khẩu là bắt buộc');
    });

    it('should reject password shorter than 6 characters', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345'
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow('Mật khẩu phải có ít nhất 6 ký tự');
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', async () => {
      const validData = {
        email: 'test@example.com'
      };

      await expect(forgotPasswordSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject empty email', async () => {
      const invalidData = {
        email: ''
      };

      await expect(forgotPasswordSchema.validate(invalidData)).rejects.toThrow('Email là bắt buộc');
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email'
      };

      await expect(forgotPasswordSchema.validate(invalidData)).rejects.toThrow('Email không hợp lệ');
    });
  });

  describe('resetCodeSchema', () => {
    it('should validate correct reset code', async () => {
      const validData = {
        code: 'ABC12'
      };

      await expect(resetCodeSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject empty code', async () => {
      const invalidData = {
        code: ''
      };

      await expect(resetCodeSchema.validate(invalidData)).rejects.toThrow('Mã xác nhận là bắt buộc');
    });

    it('should reject code with wrong length', async () => {
      const invalidData = {
        code: 'ABC1'
      };

      await expect(resetCodeSchema.validate(invalidData)).rejects.toThrow('Mã xác nhận phải có đúng 5 ký tự');
    });

    it('should reject code with lowercase letters', async () => {
      const invalidData = {
        code: 'abc12'
      };

      await expect(resetCodeSchema.validate(invalidData)).rejects.toThrow('Mã xác nhận chỉ chứa chữ cái in hoa và số');
    });

    it('should reject code with special characters', async () => {
      const invalidData = {
        code: 'ABC-1'
      };

      await expect(resetCodeSchema.validate(invalidData)).rejects.toThrow('Mã xác nhận chỉ chứa chữ cái in hoa và số');
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate correct reset password data', async () => {
      const validData = {
        email: 'test@example.com',
        code: 'ABC12',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123'
      };

      await expect(resetPasswordSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject mismatched passwords', async () => {
      const invalidData = {
        email: 'test@example.com',
        code: 'ABC12',
        newPassword: 'NewPass123',
        confirmPassword: 'DifferentPass123'
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow('Mật khẩu xác nhận không khớp');
    });

    it('should reject password shorter than 8 characters', async () => {
      const invalidData = {
        email: 'test@example.com',
        code: 'ABC12',
        newPassword: 'Pass123',
        confirmPassword: 'Pass123'
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow('Mật khẩu phải có ít nhất 8 ký tự');
    });

    it('should reject password without uppercase letter', async () => {
      const invalidData = {
        email: 'test@example.com',
        code: 'ABC12',
        newPassword: 'password123',
        confirmPassword: 'password123'
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
    });

    it('should reject password without lowercase letter', async () => {
      const invalidData = {
        email: 'test@example.com',
        code: 'ABC12',
        newPassword: 'PASSWORD123',
        confirmPassword: 'PASSWORD123'
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
    });

    it('should reject password without number', async () => {
      const invalidData = {
        email: 'test@example.com',
        code: 'ABC12',
        newPassword: 'Password',
        confirmPassword: 'Password'
      };

      await expect(resetPasswordSchema.validate(invalidData)).rejects.toThrow('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should return true for valid phone', () => {
      expect(validatePhone('0123456789')).toBe(true);
      expect(validatePhone('+84123456789')).toBe(true);
      expect(validatePhone('(012) 345-6789')).toBe(true);
    });

    it('should return false for invalid phone', () => {
      expect(validatePhone('abc123')).toBe(false);
      expect(validatePhone('12@34')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
    });

    it('should return false for password without uppercase', () => {
      expect(validatePassword('password123')).toBe(false);
    });

    it('should return false for password without lowercase', () => {
      expect(validatePassword('PASSWORD123')).toBe(false);
    });

    it('should return false for password without number', () => {
      expect(validatePassword('Password')).toBe(false);
    });

    it('should return false for password shorter than 8 characters', () => {
      expect(validatePassword('Pass123')).toBe(false);
    });
  });
});

