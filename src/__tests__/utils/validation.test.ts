import { describe, it, expect } from 'vitest';
import { ValidationUtils } from '../../utils/validation';

describe('ValidationUtils', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(ValidationUtils.sanitizeString('<script>alert("xss")</script>'))
        .toBe('scriptalert("xss")/script');
    });

    it('should remove javascript: protocol', () => {
      expect(ValidationUtils.sanitizeString('javascript:alert(1)'))
        .toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(ValidationUtils.sanitizeString('onclick=alert(1)'))
        .toBe('alert(1)');
    });

    it('should trim whitespace', () => {
      expect(ValidationUtils.sanitizeString('  test  '))
        .toBe('test');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(ValidationUtils.isValidEmail('@example.com')).toBe(false);
      expect(ValidationUtils.isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should validate positive numbers', () => {
      expect(ValidationUtils.isValidAmount(100)).toBe(true);
      expect(ValidationUtils.isValidAmount('100.50')).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(ValidationUtils.isValidAmount(-10)).toBe(false);
    });

    it('should reject NaN', () => {
      expect(ValidationUtils.isValidAmount('abc')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate correct date format', () => {
      expect(ValidationUtils.isValidDate('2024-01-15')).toBe(true);
    });

    it('should reject invalid date format', () => {
      expect(ValidationUtils.isValidDate('15/01/2024')).toBe(false);
      expect(ValidationUtils.isValidDate('2024-13-01')).toBe(false);
    });
  });

  describe('limitLength', () => {
    it('should limit string length', () => {
      expect(ValidationUtils.limitLength('hello world', 5))
        .toBe('hello');
    });

    it('should not truncate if within limit', () => {
      expect(ValidationUtils.limitLength('test', 10))
        .toBe('test');
    });
  });
});
