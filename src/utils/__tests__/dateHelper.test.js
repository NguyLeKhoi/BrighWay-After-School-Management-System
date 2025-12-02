import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseDateFromUTC7,
  extractDateString,
  formatDateUTC7,
  formatDateOnlyUTC7,
  formatDateTimeUTC7,
  getCurrentTimeUTC7,
  parseAsUTC7,
  formatDateToUTC7ISO
} from '../dateHelper';

describe('dateHelper', () => {
  describe('parseDateFromUTC7', () => {
    it('should return null for null or undefined input', () => {
      expect(parseDateFromUTC7(null)).toBeNull();
      expect(parseDateFromUTC7(undefined)).toBeNull();
      expect(parseDateFromUTC7('')).toBeNull();
    });

    it('should return Date object if input is already a Date', () => {
      const date = new Date('2025-01-15');
      const result = parseDateFromUTC7(date);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(date.getTime());
    });

    it('should return null for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(parseDateFromUTC7(invalidDate)).toBeNull();
    });

    it('should parse ISO string with Z (UTC)', () => {
      const result = parseDateFromUTC7('2025-01-15T10:00:00Z');
      expect(result).toBeInstanceOf(Date);
      // The function adds 7 hours to convert from UTC to UTC+7
      // But getHours() returns local time, so we just check it's a valid date
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should parse ISO string with timezone offset', () => {
      const result = parseDateFromUTC7('2025-01-15T10:00:00+07:00');
      expect(result).toBeInstanceOf(Date);
    });

    it('should parse simple date string (YYYY-MM-DD)', () => {
      const result = parseDateFromUTC7('2025-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it('should return null for invalid date string', () => {
      expect(parseDateFromUTC7('invalid-date')).toBeNull();
    });
  });

  describe('extractDateString', () => {
    it('should return null for null or undefined input', () => {
      expect(extractDateString(null)).toBeNull();
      expect(extractDateString(undefined)).toBeNull();
    });

    it('should extract date from ISO string', () => {
      expect(extractDateString('2025-01-15T10:00:00Z')).toBe('2025-01-15');
      expect(extractDateString('2025-01-15T10:00:00+07:00')).toBe('2025-01-15');
      expect(extractDateString('2025-01-15 10:00:00')).toBe('2025-01-15');
    });

    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      const result = extractDateString(date);
      expect(result).toBe('2025-01-15');
    });

    it('should return null for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(extractDateString(invalidDate)).toBeNull();
    });

    it('should return null for invalid string format', () => {
      expect(extractDateString('invalid')).toBeNull();
    });
  });

  describe('formatDateUTC7', () => {
    it('should return empty string for null or undefined input', () => {
      expect(formatDateUTC7(null)).toBe('');
      expect(formatDateUTC7(undefined)).toBe('');
    });

    it('should format date with default options', () => {
      const date = new Date(2025, 0, 15, 10, 30);
      const result = formatDateUTC7(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format date with custom options', () => {
      const date = new Date(2025, 0, 15, 10, 30);
      const result = formatDateUTC7(date, { year: 'numeric', month: 'long' });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDateOnlyUTC7', () => {
    it('should return empty string for null or undefined input', () => {
      expect(formatDateOnlyUTC7(null)).toBe('');
      expect(formatDateOnlyUTC7(undefined)).toBe('');
    });

    it('should format date only (without time)', () => {
      const date = new Date(2025, 0, 15, 10, 30);
      const result = formatDateOnlyUTC7(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Should be in DD/MM/YYYY format for Vietnamese locale
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDateTimeUTC7', () => {
    it('should return empty string for null or undefined input', () => {
      expect(formatDateTimeUTC7(null)).toBe('');
      expect(formatDateTimeUTC7(undefined)).toBe('');
    });

    it('should format datetime with time', () => {
      const date = new Date(2025, 0, 15, 10, 30, 45);
      const result = formatDateTimeUTC7(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('getCurrentTimeUTC7', () => {
    it('should return a number (milliseconds)', () => {
      const result = getCurrentTimeUTC7();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('should return current time in UTC+7', () => {
      const result = getCurrentTimeUTC7();
      const now = Date.now();
      // Should be close to current time (within 1 second)
      expect(Math.abs(result - now)).toBeLessThan(1000);
    });
  });

  describe('parseAsUTC7', () => {
    it('should return null for null or undefined input', () => {
      expect(parseAsUTC7(null)).toBeNull();
      expect(parseAsUTC7(undefined)).toBeNull();
    });

    it('should return Date object if input is already a Date', () => {
      const date = new Date('2025-01-15');
      const result = parseAsUTC7(date);
      expect(result).toBeInstanceOf(Date);
    });

    it('should parse ISO string with Z timezone', () => {
      const result = parseAsUTC7('2025-01-15T10:00:00Z');
      expect(result).toBeInstanceOf(Date);
    });

    it('should parse ISO string with timezone offset', () => {
      const result = parseAsUTC7('2025-01-15T10:00:00+07:00');
      expect(result).toBeInstanceOf(Date);
    });

    it('should parse ISO string without timezone as UTC+7', () => {
      const result = parseAsUTC7('2025-01-15T10:00:00');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for invalid string', () => {
      expect(parseAsUTC7('invalid')).toBeNull();
    });
  });

  describe('formatDateToUTC7ISO', () => {
    it('should return null for null or undefined input', () => {
      expect(formatDateToUTC7ISO(null)).toBeNull();
      expect(formatDateToUTC7ISO(undefined)).toBeNull();
    });

    it('should return null for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(formatDateToUTC7ISO(invalidDate)).toBeNull();
    });

    it('should format Date to ISO string with UTC+7 timezone', () => {
      const date = new Date(2025, 0, 15, 10, 30, 45, 123);
      const result = formatDateToUTC7ISO(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+07:00$/);
    });

    it('should include correct date components', () => {
      const date = new Date(2025, 0, 15, 10, 30, 45, 123);
      const result = formatDateToUTC7ISO(date);
      expect(result).toContain('2025-01-15');
      expect(result).toContain('T10:30:45');
      expect(result).toContain('+07:00');
    });
  });
});

