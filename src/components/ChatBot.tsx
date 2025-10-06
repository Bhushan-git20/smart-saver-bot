import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AIService } from '@/services/ai.service';
import { SupabaseService } from '@/services/supabase.service';
import { ValidationUtils } from '@/utils/validation';
import { MonitoringService } from '@/services/monitoring.service';
import { useRateLimit } from '@/hooks/useRateLimit';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI Financial Advisor. I can help you analyze your expenses, suggest budget plans, and provide investment advice. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkRateLimit } = useRateLimit({ endpoint: 'ai-chat', maxRequests: 10, windowMinutes: 1 });

  const sendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    // Validate input
    const sanitizedMessage = ValidationUtils.sanitizeString(inputValue);
    if (!sanitizedMessage || sanitizedMessage.length > 1000) {
      toast({ title: 'Error', description: 'Invalid message', variant: 'destructive' });
      return;
    }

    // Check rate limit
    if (!(await checkRateLimit())) {
      toast({ title: 'Rate Limit', description: 'Too many requests. Please wait a moment.', variant: 'destructive' });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: sanitizedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get transaction data for context
      const transactions = await SupabaseService.getTransactions(user.id, 10);

      // Calculate financial summary
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
      const categoryCount = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + (t.amount || 0);
        return acc;
      }, {} as Record<string, number>);
      
      const topCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      const transactionData = {
        totalIncome,
        totalExpenses,
        topCategories,
        recentTransactions: transactions
      };

      // Call AI service with retry logic
      const response = await AIService.sendChatMessage({
        message: sanitizedMessage,
        financialData: transactionData,
        userProfile: { riskProfile: 'medium' }
      });

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response || 'I apologize, but I couldn\'t process your request at the moment. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      MonitoringService.captureError(error as Error, { userId: user.id, component: 'ChatBot', action: 'sendMessage' });
      toast({
        title: 'Error',
        description: 'Failed to get response from AI assistant. Please try again.',
        variant: 'destructive',
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble connecting right now. Please check your internet connection and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <Card className={`max-w-[80%] ${
              message.type === 'user' ? 'bg-primary text-primary-foreground' : ''
            }`}>
              <CardContent className="p-3">
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </CardContent>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your finances..."
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!inputValue.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};