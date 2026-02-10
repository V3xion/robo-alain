 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
 };
 
 // Validate admin token
 function isValidAdminToken(token: string | null): boolean {
   if (!token) return false;
   try {
     const decoded = atob(token);
     return decoded.startsWith("admin:");
   } catch {
     return false;
   }
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     // Validate admin token
     const adminToken = req.headers.get("x-admin-token");
     if (!isValidAdminToken(adminToken)) {
       return new Response(
         JSON.stringify({ error: "Unauthorized" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     const { operation, table, data, id } = await req.json();
 
     // Allowed tables for admin operations
     const allowedTables = ["bookings", "barbers", "services"];
     if (!allowedTables.includes(table)) {
       return new Response(
         JSON.stringify({ error: "Invalid table" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     let result;
 
     switch (operation) {
       case "select":
         result = await supabase
           .from(table)
           .select("*")
           .order("created_at", { ascending: table !== "bookings" });
         break;
 
       case "insert":
         result = await supabase.from(table).insert(data).select().single();
         break;
 
       case "update":
         if (!id) {
           return new Response(
             JSON.stringify({ error: "ID required for update" }),
             { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
           );
         }
         result = await supabase.from(table).update(data).eq("id", id).select().single();
         break;
 
       case "delete":
         if (!id) {
           return new Response(
             JSON.stringify({ error: "ID required for delete" }),
             { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
           );
         }
         result = await supabase.from(table).delete().eq("id", id);
         break;
 
       default:
         return new Response(
           JSON.stringify({ error: "Invalid operation" }),
           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
     }
 
     if (result.error) {
       console.error("Database error:", result.error);
       return new Response(
         JSON.stringify({ error: result.error.message }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     return new Response(
       JSON.stringify({ data: result.data, success: true }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("Error:", error);
     return new Response(
       JSON.stringify({ error: "An error occurred" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });