import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createWorker } from "https://esm.sh/tesseract.js@5.0.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    // Rate limit check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    console.log('Starting OCR processing...');
    
    // Initialize Tesseract worker
    const worker = await createWorker('eng');
    
    // Process image
    const { data: { text } } = await worker.recognize(image);
    
    await worker.terminate();
    
    console.log('OCR processing complete');

    // Extract transaction data from text
    const lines = text.split('\n').filter(line => line.trim());
    const amountRegex = /\$?\d+\.?\d*/;
    const dateRegex = /\d{1,2}\/\d{1,2}\/\d{2,4}/;
    
    let amount = null;
    let date = null;
    let merchant = null;

    for (const line of lines) {
      const amountMatch = line.match(amountRegex);
      const dateMatch = line.match(dateRegex);
      
      if (amountMatch && !amount) {
        amount = parseFloat(amountMatch[0].replace('$', ''));
      }
      if (dateMatch && !date) {
        date = dateMatch[0];
      }
      if (!merchant && line.length > 3 && line.length < 50) {
        merchant = line.trim();
      }
    }

    return new Response(
      JSON.stringify({
        text,
        extracted: {
          amount,
          date,
          merchant,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('OCR Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
