import { describe, it, expect } from 'vitest';
import { contactRequestSchema } from '../contactSchemas';

describe('contactRequestSchema', () => {
  describe('valid data', () => {
    it('should validate correct contact request', async () => {
      const validData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        message: 'Tôi muốn tìm hiểu về dịch vụ của trung tâm'
      };

      await expect(contactRequestSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should validate with optional childrenAgeRange', async () => {
      const validData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        childrenAgeRange: '5-10 tuổi',
        message: 'Tôi muốn tìm hiểu về dịch vụ của trung tâm'
      };

      await expect(contactRequestSchema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('parentName validation', () => {
    it('should reject empty parentName', async () => {
      const invalidData = {
        parentName: '',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Họ và tên phụ huynh là bắt buộc');
    });

    it('should reject parentName shorter than 2 characters', async () => {
      const invalidData = {
        parentName: 'A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Họ và tên phải có ít nhất 2 ký tự');
    });

    it('should reject parentName longer than 100 characters', async () => {
      const invalidData = {
        parentName: 'A'.repeat(101),
        email: 'test@example.com',
        phoneNumber: '0123456789',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Họ và tên không được vượt quá 100 ký tự');
    });
  });

  describe('email validation', () => {
    it('should reject empty email', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: '',
        phoneNumber: '0123456789',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Email là bắt buộc');
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'invalid-email',
        phoneNumber: '0123456789',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Email không hợp lệ');
    });

    it('should reject email longer than 100 characters', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'a'.repeat(95) + '@test.com', // 100+ characters
        phoneNumber: '0123456789',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Email không được vượt quá 100 ký tự');
    });
  });

  describe('phoneNumber validation', () => {
    it('should reject empty phoneNumber', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Số điện thoại là bắt buộc');
    });

    it('should reject phoneNumber with less than 10 digits', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '123456789',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Số điện thoại phải có 10-11 chữ số');
    });

    it('should reject phoneNumber with more than 11 digits', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '123456789012',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Số điện thoại phải có 10-11 chữ số');
    });

    it('should reject phoneNumber with non-numeric characters', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '012345678a',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Số điện thoại phải có 10-11 chữ số');
    });

    it('should accept 10-digit phoneNumber', async () => {
      const validData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should accept 11-digit phoneNumber', async () => {
      const validData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '01234567890',
        message: 'Test message'
      };

      await expect(contactRequestSchema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('message validation', () => {
    it('should reject empty message', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        message: ''
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Nội dung yêu cầu là bắt buộc');
    });

    it('should reject message shorter than 10 characters', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        message: 'Short'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Nội dung phải có ít nhất 10 ký tự');
    });

    it('should reject message longer than 1000 characters', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        message: 'A'.repeat(1001)
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Nội dung không được vượt quá 1000 ký tự');
    });
  });

  describe('childrenAgeRange validation', () => {
    it('should accept valid childrenAgeRange', async () => {
      const validData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        childrenAgeRange: '5-10 tuổi',
        message: 'Test message with enough characters'
      };

      await expect(contactRequestSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject childrenAgeRange longer than 50 characters', async () => {
      const invalidData = {
        parentName: 'Nguyễn Văn A',
        email: 'test@example.com',
        phoneNumber: '0123456789',
        childrenAgeRange: 'A'.repeat(51),
        message: 'Test message with enough characters'
      };

      await expect(contactRequestSchema.validate(invalidData)).rejects.toThrow('Độ tuổi không được vượt quá 50 ký tự');
    });
  });
});

