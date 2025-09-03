import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, transactionData, userProfile } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Create financial context from user data
    const financialContext = transactionData ? `
User's Recent Financial Data:
- Total Income: ₹${transactionData.totalIncome?.toLocaleString() || 0}
- Total Expenses: ₹${transactionData.totalExpenses?.toLocaleString() || 0}
- Net Balance: ₹${(transactionData.totalIncome - transactionData.totalExpenses)?.toLocaleString() || 0}
- Top Spending Categories: ${transactionData.topCategories?.join(', ') || 'None'}
- Recent Transactions Count: ${transactionData.recentTransactions?.length || 0}
` : '';

    const systemPrompt = `You are an AI Financial Advisor specializing in personal finance for Indian users. You provide practical, actionable advice on:

1. Expense tracking and budgeting
2. Investment recommendations (mutual funds, SIPs, FDs, stocks)
3. Savings strategies
4. Tax planning
5. Financial goal setting

Guidelines:
- Always use Indian Rupees (₹) for monetary values
- Consider Indian financial products and regulations
- Provide specific, actionable advice
- Be encouraging and supportive
- If you don't have enough information, ask clarifying questions
- Keep responses concise but comprehensive

${financialContext}

Risk Profile: ${userProfile?.riskProfile || 'Not specified'}

Based on this context, provide personalized financial advice.`;

    console.log('Sending request to OpenAI with message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Received response from OpenAI:', aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-financial-chat function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});