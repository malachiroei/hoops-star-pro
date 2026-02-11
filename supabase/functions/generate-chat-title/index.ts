 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { message, hasVideo, videoContext } = await req.json();
 
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     const prompt = `צור כותרת קצרה וברורה (עד 40 תווים) לשיחה עם מאמן כדורסל, על בסיס ההודעה הראשונה של השחקן.
 
 הנחיות:
 - הכותרת צריכה לתאר את הנושא בקצרה
 - אם יש ניתוח משחק, ציין את היריב והתאריך אם יש
 - אם יש וידאו, ציין "ניתוח וידאו"
 - תמיד בעברית
 - אל תוסיף סימני פיסוק או גרשיים בסוף
 
 דוגמאות:
 - "ניתוח משחק מול הפועל ת"א 25.12"
 - "שיפור זריקות לסל"
 - "הכנה למשחק הבא"
 - "ניתוח וידאו - כדרור"
 - "משחק גרוע - טיפים להתאוששות"
 
 ההודעה: "${message}"
 ${hasVideo ? `\nיש וידאו: כן` : ""}
 ${videoContext ? `\nהקשר הוידאו: ${videoContext}` : ""}
 
 החזר רק את הכותרת, ללא הסברים נוספים.`;
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-2.5-flash-lite",
         messages: [{ role: "user", content: prompt }],
         max_tokens: 60,
       }),
     });
 
     if (!response.ok) {
       console.error("AI gateway error:", response.status);
       return new Response(JSON.stringify({ title: message.substring(0, 30) + "..." }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const data = await response.json();
     const title = data.choices?.[0]?.message?.content?.trim() || message.substring(0, 30) + "...";
 
     return new Response(JSON.stringify({ title }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("Generate title error:", error);
     return new Response(JSON.stringify({ title: "שיחה חדשה" }), {
       status: 200,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });