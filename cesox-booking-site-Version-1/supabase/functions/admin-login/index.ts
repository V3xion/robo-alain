import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const hashPassword = async (password: string) => {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     if (req.method !== "POST") {
       return new Response(
         JSON.stringify({ error: "Method not allowed" }),
         { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const { username, password } = await req.json();
 
     // Validate credentials
     if (!username || !password) {
       return new Response(
         JSON.stringify({ error: "Username and password are required" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const { data, error } = await supabase
       .from("admin_users")
       .select("id, password_hash")
       .eq("username", username)
       .single();

     if (error || !data) {
       return new Response(
         JSON.stringify({ error: "Invalid username or password" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }

     const hashedPassword = await hashPassword(password);
     if (hashedPassword !== data.password_hash) {
       return new Response(
         JSON.stringify({ error: "Invalid username or password" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }

     const sessionToken = btoa(`admin:${Date.now()}:${crypto.randomUUID()}`);

     return new Response(
       JSON.stringify({
         success: true,
         token: sessionToken,
         message: "Login successful",
       }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("Login error:", error);
     return new Response(
       JSON.stringify({ error: "An error occurred" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });
