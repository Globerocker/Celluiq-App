
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      throw new Error('No fileUrl provided');
    }

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Gemini (Google Generative AI)
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    // 1. Download PDF/Image from Storage
    console.log(`Downloading file from: ${fileUrl}`);
    const fileResponse = await fetch(fileUrl);

    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.statusText}`);
    }

    const fileBlob = await fileResponse.blob();
    const mimeType = fileBlob.type;
    const arrayBuffer = await fileBlob.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log(`File downloaded. Type: ${mimeType}, Size: ${arrayBuffer.byteLength}`);

    // 2. Prepare for Gemini 1.5 Flash
    // Gemini supports PDFs and Images natively via inline data or file API.
    // Ensure we use a supported mime type.

    const prompt = `
      You are a specialized medical analysis AI. 
      Analyze this blood work report.
      Extract ALL biomarkers found.
      
      Return ONLY a VALID JSON object (no markdown formatting) with this structure:
      {
        "biomarkers": [
          {
            "name": "Vitamin D",
            "value": 45,
            "unit": "ng/mL",
            "status": "normal",
            "recommendation": "Maintain current intake"
          }
        ],
        "summary": "Brief summary of health status"
      }
    `;

    // Call Gemini API (REST)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log("Sending to Gemini...");
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API Error: ${errText}`);
    }

    const aiData = await geminiResponse.json();
    console.log("Gemini response received");

    // Parse standard Gemini response
    const candidates = aiData.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates returned from Gemini');
    }

    const textResponse = candidates[0].content.parts[0].text;
    const result = JSON.parse(textResponse);

    // 3. Save directly to DB if we have user context
    // Getting user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));

      if (user && !userError) {
        console.log(`Saving results for user: ${user.id}`);

        // Update/Insert into blood_work table
        // First we need to find the entry that corresponds to this file, or create one.
        // Ideally we create a new entry or update the latest.
        // For simplify, let's insert a NEW record with the analysis result.

        // Note: The file has already been uploaded by the client. We assume 'fileUrl' is the path or signed url.
        // If fileUrl is a signed URL, we might want to store just the path.
        // Let's assume the client sends the public URL or we just store what we got.

        const { error: dbError } = await supabaseClient
          .from('blood_work')
          .insert({
            user_id: user.id,
            file_url: fileUrl,
            analysis_json: result
          });

        if (dbError) {
          console.error('Error saving to DB:', dbError);
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
