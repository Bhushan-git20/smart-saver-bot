import React from 'react';
import { SecurityUtils } from '@/utils/security';
import { useAuth } from './useAuth';

const { useState } = React;

interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMinutes: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { user } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);

  const checkRateLimit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const allowed = await SecurityUtils.checkRateLimit(user.id, config);
      setIsRateLimited(!allowed);
      return allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Fail open
    }
  };

  return {
    checkRateLimit,
    isRateLimited,
  };
};
