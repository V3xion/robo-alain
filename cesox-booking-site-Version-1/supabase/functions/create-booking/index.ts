 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 interface BookingRequest {
   customer_name: string;
   customer_phone: string;
   service_id: string;
   service_name: string;
   service_price: string;
   barber_id: string;
   barber_name: string;
   booking_date: string;
   booking_time: string;
 }
 
 // Validation functions
 function validatePhone(phone: string): { valid: boolean; error?: string } {
   if (!phone || typeof phone !== "string") {
     return { valid: false, error: "Phone number is required" };
   }
   if (!/^05[0-9]{8}$/.test(phone)) {
     return { valid: false, error: "Phone must be a valid UAE number (05XXXXXXXX)" };
   }
   return { valid: true };
 }
 
 function validateName(name: string): { valid: boolean; error?: string } {
   if (!name || typeof name !== "string") {
     return { valid: false, error: "Customer name is required" };
   }
   const trimmed = name.trim();
   if (trimmed.length === 0) {
     return { valid: false, error: "Customer name cannot be empty" };
   }
   if (trimmed.length > 100) {
     return { valid: false, error: "Customer name must be 100 characters or less" };
   }
   return { valid: true };
 }
 
 function validateUUID(id: string, field: string): { valid: boolean; error?: string } {
   if (!id || typeof id !== "string") {
     return { valid: false, error: `${field} is required` };
   }
   const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
   if (!uuidRegex.test(id)) {
     return { valid: false, error: `Invalid ${field} format` };
   }
   return { valid: true };
 }
 
 function validateStringLength(value: string, field: string, maxLength: number): { valid: boolean; error?: string } {
   if (!value || typeof value !== "string") {
     return { valid: false, error: `${field} is required` };
   }
   if (value.trim().length === 0) {
     return { valid: false, error: `${field} cannot be empty` };
   }
   if (value.length > maxLength) {
     return { valid: false, error: `${field} must be ${maxLength} characters or less` };
   }
   return { valid: true };
 }
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     if (req.method !== "POST") {
       return new Response(
         JSON.stringify({ error: "Method not allowed" }),
         { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const body: BookingRequest = await req.json();
 
     // Validate all inputs
     const validations = [
       validateName(body.customer_name),
       validatePhone(body.customer_phone),
       validateUUID(body.service_id, "Service ID"),
       validateStringLength(body.service_name, "Service name", 200),
       validateStringLength(body.service_price, "Service price", 50),
       validateUUID(body.barber_id, "Barber ID"),
       validateStringLength(body.barber_name, "Barber name", 100),
       validateStringLength(body.booking_date, "Booking date", 50),
       validateStringLength(body.booking_time, "Booking time", 20),
     ];
 
     const failedValidation = validations.find(v => !v.valid);
     if (failedValidation) {
       return new Response(
         JSON.stringify({ error: failedValidation.error }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Check rate limit using database function
     const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
     
     const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc(
       "check_booking_rate_limit",
       { p_phone: body.customer_phone, p_ip: clientIP }
     );
 
     if (rateLimitError) {
       console.error("Rate limit check error:", rateLimitError);
       // Continue anyway if rate limit check fails
     } else if (!rateLimitOk) {
       return new Response(
         JSON.stringify({ error: "Too many booking attempts. Please try again in an hour." }),
         { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Verify service exists and is active
     const { data: service, error: serviceError } = await supabase
       .from("services")
       .select("id, name, price, is_active")
       .eq("id", body.service_id)
       .maybeSingle();
 
     if (serviceError || !service) {
       return new Response(
         JSON.stringify({ error: "Invalid service selected" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     if (!service.is_active) {
       return new Response(
         JSON.stringify({ error: "Selected service is no longer available" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Verify barber exists and is active
     const { data: barber, error: barberError } = await supabase
       .from("barbers")
       .select("id, name, is_active")
       .eq("id", body.barber_id)
       .maybeSingle();
 
     if (barberError || !barber) {
       return new Response(
         JSON.stringify({ error: "Invalid barber selected" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     if (!barber.is_active) {
       return new Response(
         JSON.stringify({ error: "Selected barber is no longer available" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create booking with validated and sanitized data
     const { data: booking, error: bookingError } = await supabase
       .from("bookings")
       .insert({
         customer_name: body.customer_name.trim(),
         customer_phone: body.customer_phone,
         service_id: body.service_id,
         service_name: service.name, // Use verified service name
         service_price: service.price, // Use verified service price
         barber_id: body.barber_id,
         barber_name: barber.name, // Use verified barber name
         booking_date: body.booking_date,
         booking_time: body.booking_time,
         status: "pending",
       })
       .select()
       .single();
 
     if (bookingError) {
       console.error("Booking creation error:", bookingError);
       
       // Check for duplicate booking constraint violation
       if (bookingError.code === "23505") {
         return new Response(
           JSON.stringify({ error: "You already have a booking for this time slot" }),
           { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       
       // Check for constraint violations
       if (bookingError.code === "23514") {
         return new Response(
           JSON.stringify({ error: "Invalid booking data. Please check your inputs." }),
           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
 
       return new Response(
         JSON.stringify({ error: "Failed to create booking. Please try again." }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     return new Response(
       JSON.stringify({ data: booking, success: true }),
       { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("Unexpected error:", error);
     return new Response(
       JSON.stringify({ error: "An unexpected error occurred" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });