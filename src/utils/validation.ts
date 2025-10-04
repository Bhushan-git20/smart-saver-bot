/**
 * Input Validation Utilities
 * Sanitize and validate user inputs to prevent XSS/injection attacks
 */

export class ValidationUtils {
  /**
   * Sanitize string input by removing potentially dangerous characters
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate and sanitize CSV/Excel input
   */
  static sanitizeFileInput(input: string): string {
    return input
      .replace(/[<>'"]/g, '') // Remove dangerous characters
      .replace(/^\s*=/, '') // Remove formula injection attempts
      .trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate numeric amount
   */
  static isValidAmount(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num >= 0 && isFinite(num);
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  static isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * Limit string length to prevent buffer overflow
   */
  static limitLength(input: string, maxLength: number): string {
    return input.slice(0, maxLength);
  }
}
