import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

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

    const HF_TOKEN = Deno.env.get('OPENAI_API_KEY'); // Using the updated secret
    if (!HF_TOKEN) {
      throw new Error('Hugging Face API key not configured');
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

    console.log('Sending request to Hugging Face with message:', message);

    const hf = new HfInference(HF_TOKEN);

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium',
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    });

    const aiResponse = response.generated_text;

    console.log('Received response from Hugging Face:', aiResponse);

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