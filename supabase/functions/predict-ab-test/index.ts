import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => { // Type explicitly as Request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { variantA, variantB } = await req.json();

        if (!variantA || !variantB) {
            throw new Error('Both variants are required');
        }

        const openAiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAiKey) {
            throw new Error('OPENAI_API_KEY is not configured');
        }

        const prompt = `
      Analyze these two email subject lines and predict the winner for an e-commerce campaign.
      
      Variant A: "${variantA}"
      Variant B: "${variantB}"
      
      Evaluate based on:
      1. Urgency and Scarcity
      2. Curiosity and Benefit
      3. Length and Clarity
      
      Return ONLY a JSON object (no markdown) with this structure:
      {
        "winner": "A" or "B",
        "confidence": number between 50 and 99,
        "lift": number between 5 and 50 (estimated conversion lift),
        "reasoning": "short explanation why"
      }
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
                    { role: 'system', content: 'You are an expert e-commerce copywriter and data scientist.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        const resultText = data.choices[0].message.content;
        let result;
        try {
            result = JSON.parse(resultText);
        } catch {
            // Fallback if AI returns text wrapped in markdown
            const jsonMatch = resultText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Failed to parse AI response");
            }
        }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
