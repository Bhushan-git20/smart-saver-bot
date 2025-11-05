import React from 'react';

const { useState, useEffect, useRef } = React;
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Settings, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/supabase.service';
import { MonitoringService } from '@/services/monitoring.service';
import { ValidationUtils } from '@/utils/validation';
import { useRateLimit } from '@/hooks/useRateLimit';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  provider?: string;
}

interface ConversationHistory {
  message: string;
  response: string;
  created_at: string;
}

interface TransactionData {
  totalIncome: number;
  totalExpenses: number;
  topCategories: string[];
  recentTransactions: any[];
  categoryBreakdown: Record<string, number>;
}

export const ChatBotAdvanced = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'huggingface'>('openai');
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversationHistory();
      fetchTransactionData();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('message, response, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConversationHistory(data || []);
    } catch (error) {
      MonitoringService.captureError(error as Error, {
        component: 'ChatBotAdvanced',
        action: 'fetchConversationHistory',
        userId: user?.id
      });
    }
  };

  const fetchTransactionData = async () => {
    if (!user?.id) return;

    try {
      const transactions = await SupabaseService.getTransactions(user.id, 50);

      if (transactions && transactions.length > 0) {
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const categoryBreakdown = transactions
          .filter(t => t.type === 'expense')
          .reduce((acc: Record<string, number>, t) => {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
            return acc;
          }, {});

        const topCategories = Object.entries(categoryBreakdown)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category]) => category);

        setTransactionData({
          totalIncome,
          totalExpenses,
          topCategories,
          recentTransactions: transactions.slice(0, 10),
          categoryBreakdown
        });
      }
    } catch (error) {
      MonitoringService.captureError(error as Error, {
        component: 'ChatBotAdvanced',
        action: 'fetchTransactionData',
        userId: user.id
      });
    }
  };

  const { checkRateLimit } = useRateLimit({
    endpoint: 'ai-chat-advanced',
    maxRequests: 20,
    windowMinutes: 1
  });

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    // Validate input
    const sanitizedMessage = ValidationUtils.sanitizeString(inputValue.trim());
    if (sanitizedMessage.length < 1 || sanitizedMessage.length > 1000) {
      toast({
        title: "Invalid Input",
        description: "Message must be between 1 and 1000 characters.",
        variant: "destructive",
      });
      return;
    }

    // Check rate limit
    const canProceed = await checkRateLimit();

    if (!canProceed) {
      toast({
        title: "Rate Limit Exceeded",
        description: "Please wait a moment before sending another message.",
        variant: "destructive",
      });
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
      const profile = await SupabaseService.getUserProfile(user.id);

      const { data, error } = await supabase.functions.invoke('ai-financial-chat-advanced', {
        body: {
          message: userMessage.content,
          transactionData,
          userProfile: profile,
          conversationHistory,
          provider: aiProvider
        },
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        provider: data.provider
      };

      setMessages(prev => [...prev, botMessage]);
      
      await fetchConversationHistory();

    } catch (error) {
      MonitoringService.captureError(error as Error, {
        component: 'ChatBotAdvanced',
        action: 'sendMessage',
        userId: user.id
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
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

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'openai':
        return <Sparkles className="w-3 h-3" />;
      case 'huggingface':
        return <Brain className="w-3 h-3" />;
      default:
        return <Bot className="w-3 h-3" />;
    }
  };

  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'huggingface':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Provider Selection */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">AI Provider:</span>
          <Select value={aiProvider} onValueChange={(value: 'openai' | 'huggingface') => setAiProvider(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  OpenAI GPT
                </div>
              </SelectItem>
              <SelectItem value="huggingface">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Hugging Face
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {transactionData && (
          <Badge variant="secondary" className="text-xs">
            {transactionData.recentTransactions.length} transactions analyzed
          </Badge>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">AI Financial Assistant</h3>
            <p className="text-sm">
              Ask me anything about your finances, budgeting, investments, or saving strategies.
              I can analyze your transaction data to provide personalized advice.
            </p>
            {transactionData && (
              <div className="mt-4 text-xs bg-muted/50 rounded-lg p-3 max-w-md mx-auto">
                <p className="font-medium mb-1">Your Financial Overview:</p>
                <p>Monthly Income: ₹{transactionData.totalIncome.toLocaleString()}</p>
                <p>Monthly Expenses: ₹{transactionData.totalExpenses.toLocaleString()}</p>
                <p>Net Savings: ₹{(transactionData.totalIncome - transactionData.totalExpenses).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'bot' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {getProviderIcon(message.provider)}
                </div>
              </div>
            )}
            
            <Card className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.type === 'bot' && message.provider && (
                    <Badge variant="secondary" className={`text-xs flex-shrink-0 ${getProviderColor(message.provider)}`}>
                      {message.provider}
                    </Badge>
                  )}
                </div>
                <p className={`text-xs mt-2 opacity-70 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
            
            {message.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {getProviderIcon(aiProvider)}
              </div>
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Analyzing your financial data...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about budgeting, investments, saving strategies..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!inputValue.trim() || isLoading} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};