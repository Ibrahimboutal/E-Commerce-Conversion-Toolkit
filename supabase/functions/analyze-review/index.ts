import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { review_id, review_text } = await req.json();

        if (!review_text) {
            throw new Error("Review text is required");
        }

        const openAiKey = Deno.env.get('OPENAI_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        // If we can't update DB (missing key), we just return result 
        // But ideally we should update DB. 
        // If SERVICE_ROLE_KEY is not set, we can't update.
        // Let's assume user sets it or we just return it and let frontend handle?
        // Frontend logic calls `loadReviews()`, expecting the DB to be updated.
        // So we MUST update DB here.

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        let analysisResult = {
            sentiment: 'neutral',
            keywords: []
        };

        if (openAiKey) {
            const prompt = `
          Analyze the following customer review.
          Review: "${review_text}"
          
          1. Determine sentiment: "positive", "neutral", or "negative".
          2. Extract up to 3 short keywords/topics (e.g., "fast shipping", "poor quality").
          
          Return JSON: { "sentiment": "string", "keywords": ["string", "string"] }
        `;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openAiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful sentiment analysis assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                }),
            });

            const data = await response.json();
            const content = data.choices[0].message.content;

            try {
                analysisResult = JSON.parse(content);
            } catch {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) analysisResult = JSON.parse(jsonMatch[0]);
            }
        } else {
            // Fallback or Error? 
            // Let's throw error to prompt user to set key
            throw new Error("OPENAI_API_KEY not set");
        }

        // Update Supabase
        if (supabaseServiceKey) {
            const { error } = await supabase
                .from('reviews')
                .update({
                    sentiment: analysisResult.sentiment,
                    keywords: analysisResult.keywords,
                    analyzed: true
                })
                .eq('id', review_id);

            if (error) throw error;
        } else {
            console.warn("Missing SUPABASE_SERVICE_ROLE_KEY - cannot update DB");
        }

        return new Response(JSON.stringify(analysisResult), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
