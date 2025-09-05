import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, transactionData, userProfile, conversationHistory, provider = 'openai' } = await req.json();
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${authHeader}` } }
    });

    // Get user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Create financial context from user data
    const financialContext = transactionData ? `
User's Recent Financial Data:
- Total Income: ₹${transactionData.totalIncome?.toLocaleString() || 0}
- Total Expenses: ₹${transactionData.totalExpenses?.toLocaleString() || 0}
- Net Balance: ₹${(transactionData.totalIncome - transactionData.totalExpenses)?.toLocaleString() || 0}
- Top Spending Categories: ${transactionData.topCategories?.join(', ') || 'None'}
- Recent Transactions Count: ${transactionData.recentTransactions?.length || 0}
- Monthly Savings Rate: ${transactionData.totalIncome > 0 ? (((transactionData.totalIncome - transactionData.totalExpenses) / transactionData.totalIncome) * 100).toFixed(1) : 0}%
${transactionData.categoryBreakdown ? `
Category Breakdown:
${Object.entries(transactionData.categoryBreakdown).map(([cat, amount]: [string, any]) => `- ${cat}: ₹${amount.toLocaleString()}`).join('\n')}` : ''}
` : '';

    const systemPrompt = `You are an AI Financial Advisor specializing in personal finance for Indian users. You provide practical, actionable advice based on the user's actual financial data.

Core Expertise:
1. Expense tracking and budgeting analysis
2. Investment recommendations (mutual funds, SIPs, FDs, stocks, ELSS)
3. Tax-saving strategies (80C, 80D, etc.)
4. Emergency fund planning
5. Financial goal setting and achievement

Guidelines:
- Always use Indian Rupees (₹) for monetary values
- Consider Indian financial products, tax laws, and regulations
- Provide specific, actionable advice based on the user's financial data
- Be encouraging but realistic about financial goals
- If you don't have enough information, ask clarifying questions
- Keep responses concise but comprehensive
- Reference the user's actual spending patterns when giving advice

${financialContext}

Risk Profile: ${userProfile?.riskProfile || 'Not specified'}

${conversationHistory && conversationHistory.length > 0 ? `
Previous conversation context (last 5 messages):
${conversationHistory.slice(-5).map((conv: any) => `User: ${conv.message}\nAssistant: ${conv.response}`).join('\n\n')}
` : ''}

Based on this context and conversation history, provide personalized financial advice.`;

    let aiResponse: string;

    // Route to appropriate AI provider
    if (provider === 'openai') {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      console.log('Sending request to OpenAI with message:', message);

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await openaiResponse.json();
      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
      }
      
      aiResponse = data.choices[0].message.content;

    } else if (provider === 'huggingface') {
      const HF_TOKEN = Deno.env.get('HF_TOKEN');
      if (!HF_TOKEN) {
        throw new Error('Hugging Face API key not configured');
      }

      console.log('Sending request to Hugging Face with message:', message);

      const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      });

      const data = await hfResponse.json();
      if (!hfResponse.ok) {
        throw new Error(`Hugging Face API error: ${data.error || 'Unknown error'}`);
      }
      
      aiResponse = data[0]?.generated_text || data.generated_text;

    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }

    console.log('Received response from AI:', aiResponse);

    // Store conversation in database
    await supabase.from('chat_conversations').insert({
      user_id: user.id,
      message: message,
      response: aiResponse,
      context: {
        provider: provider,
        transactionData: transactionData ? {
          totalIncome: transactionData.totalIncome,
          totalExpenses: transactionData.totalExpenses,
          topCategories: transactionData.topCategories
        } : null,
        userProfile: userProfile
      }
    });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true,
      provider: provider
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-financial-chat-advanced function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});