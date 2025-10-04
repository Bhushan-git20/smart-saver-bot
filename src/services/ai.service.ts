/**
 * AI Service Layer
 * Handles AI chat and financial advice with retry logic
 */

import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  message: string;
  financialData?: unknown;
  userProfile?: unknown;
  conversationHistory?: unknown[];
}

interface ChatResponse {
  response: string;
}

export class AIService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;

  static async sendChatMessage(
    message: ChatMessage,
    retryCount = 0
  ): Promise<ChatResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-financial-chat-advanced', {
        body: message,
      });

      if (error) {
        // Handle rate limiting with exponential backoff
        if (error.status === 429 && retryCount < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * Math.pow(2, retryCount);
          await this.sleep(delay);
          return this.sendChatMessage(message, retryCount + 1);
        }
        throw new Error(`AI chat failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAY * Math.pow(2, retryCount);
        await this.sleep(delay);
        return this.sendChatMessage(message, retryCount + 1);
      }
      throw error;
    }
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
