
// supabase/functions/ask-ai/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Ask AI Edge Function loaded");

// --- IMPORTANT: AI Model Integration Placeholder ---
// You will need to replace this with a call to your actual AI model provider.
// 1. Add your AI provider's library to supabase/functions/_shared/import_map.json
// 2. Import the library here.
// 3. Add your secret API key using `supabase secrets set AI_API_KEY "your_key"`
// 4. Access the key here using Deno.env.get("AI_API_KEY")
async function getAiResponse(prompt: string): Promise<string> {
  // const apiKey = Deno.env.get("AI_API_KEY");
  //
  // Example with OpenAI (make sure to add "openai": "npm:openai@^4.0.0" to your import_map.json):
  /*
  import { OpenAI } from "openai";
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
          { role: "system", content: "You are a helpful AI tutor." },
          { role: "user", content: prompt },
      ],
  });
  return response.choices[0].message.content;
  */
  
  // For now, we return a simulated response after a short delay.
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `This is a simulated response from your new backend to: "${prompt}"`;
}


serve(async (req) => {
  // This is needed to invoke the function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    // Call our placeholder AI function
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
