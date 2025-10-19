import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const symbol = url.searchParams.get('symbol');
    const query = url.searchParams.get('query');

    console.log('Stock data request:', { action, symbol, query });

    if (action === 'search') {
      // Search for stocks
      const response = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query || '')}&token=${finnhubApiKey}`
      );
      const data = await response.json();
      console.log('Search results:', data);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'quote' && symbol) {
      // Get real-time quote
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`
      );
      const data = await response.json();
      console.log('Quote data:', data);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'profile' && symbol) {
      // Get company profile
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubApiKey}`
      );
      const data = await response.json();
      console.log('Profile data:', data);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or missing parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in stock-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
