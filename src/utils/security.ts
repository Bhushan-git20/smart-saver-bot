/**
 * Security Utilities
 * Rate limiting, CSRF protection, and security headers
 */

import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMinutes: number;
}

export class SecurityUtils {
  private static rateLimitCache = new Map<string, { count: number; resetAt: number }>();

  /**
   * Check rate limit (client-side cache)
   */
  static async checkRateLimit(userId: string, config: RateLimitConfig): Promise<boolean> {
    const key = `${userId}:${config.endpoint}`;
    const now = Date.now();
    
    // Check client-side cache first
    const cached = this.rateLimitCache.get(key);
    if (cached && cached.resetAt > now) {
      if (cached.count >= config.maxRequests) {
        return false;
      }
      cached.count++;
      return true;
    }

    // Check server-side rate limit
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        _user_id: userId,
        _endpoint: config.endpoint,
        _max_requests: config.maxRequests,
        _window_minutes: config.windowMinutes,
      });

      if (error) throw error;

      // Update cache
      const resetAt = now + config.windowMinutes * 60 * 1000;
      this.rateLimitCache.set(key, {
        count: 1,
        resetAt,
      });

      return data as boolean;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Fail open
    }
  }

  /**
   * Sanitize file upload
   */
  static validateFileUpload(file: File, options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = (options?.maxSizeMB || 10) * 1024 * 1024;
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${options?.maxSizeMB || 10}MB limit`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) return false;
    return token === storedToken;
  }

  /**
   * Set security headers (for client-side meta tags)
   */
  static setSecurityHeaders(): void {
    // Content Security Policy
    const csp = document.createElement('meta');
    csp.httpEquiv = 'Content-Security-Policy';
    csp.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.openai.com",
      "frame-ancestors 'none'",
    ].join('; ');
    document.head.appendChild(csp);

    // X-Frame-Options
    const xFrame = document.createElement('meta');
    xFrame.httpEquiv = 'X-Frame-Options';
    xFrame.content = 'DENY';
    document.head.appendChild(xFrame);

    // X-Content-Type-Options
    const xContent = document.createElement('meta');
    xContent.httpEquiv = 'X-Content-Type-Options';
    xContent.content = 'nosniff';
    document.head.appendChild(xContent);
  }

  /**
   * Sanitize URL for redirects
   */
  static sanitizeRedirectURL(url: string, allowedDomains: string[]): string | null {
    try {
      const parsed = new URL(url, window.location.origin);
      
      // Check if domain is allowed
      if (allowedDomains.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`))) {
        return parsed.toString();
      }
      
      return null;
    } catch {
      return null;
    }
  }
}
