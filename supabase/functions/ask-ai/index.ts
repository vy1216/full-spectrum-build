
// supabase/functions/ask-ai/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize the Google Generative AI client
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const MODEL_NAME = "gemini-pro";

async function getAiResponse(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const chat = model.startChat({
    generationConfig,
    history: [
        {
          role: "user",
          parts: [{ text: "You are an expert AI tutor. Your goal is to help users learn by providing clear, concise explanations and helpful examples. When a user asks a question, provide a step-by-step explanation that is easy to follow. Use markdown for code snippets and formatting to make the answer readable." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am an expert AI tutor ready to help you learn. Ask me anything!" }],
        },
    ],
  });

  const result = await chat.sendMessage(prompt);
  const response = result.response;
  return response.text();
}

serve(async (req) => {
  // This is needed to invoke the function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    // Call our AI function
    const aiResponse = await getAiResponse(prompt);

    return new Response(JSON.stringify({ answer: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
