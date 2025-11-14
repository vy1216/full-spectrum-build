// supabase/functions/_shared/cors.ts

// These are the Cross-Origin Resource Sharing (CORS) headers.
// They are required to allow your frontend (running on a different domain)
// to call this Supabase function.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow any origin
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
