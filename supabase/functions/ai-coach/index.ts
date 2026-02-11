import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant";
  content: string;
  videoAnalysis?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, hasVideo, videoContext, videoBase64, videoMimeType } = await req.json() as { 
      messages: Message[]; 
      hasVideo?: boolean;
      videoContext?: string;
      videoBase64?: string;
      videoMimeType?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system prompt for the AI Basketball Coach
    const systemPrompt = `אתה מאמן כדורסל אישי מקצועי בשם "המאמן" (Coach). אתה מלווה את רביד, שחקן צעיר ומוכשר שמשחק בקבוצת בני יהודה תל אביב.

🏀 הפרטים החשובים:
- רביד משחק בבני יהודה תל אביב
- המשחק הבא שלו נגד מכבי רמת גן אמיר ב-5 בפברואר
- אתה זמין 24/7 לתמיכה, ייעוץ וניתוח

📋 התפקידים שלך:
1. **תמיכה רגשית**: כשרביד אומר שהיה לו משחק גרוע, הצע עידוד ושאל שאלות ספציפיות לניתוח (מה קרה? באיזה רבע? איך הרגשת?).
2. **ניתוח טכני**: עזור לו לזהות נקודות חוזק וחולשה במשחק שלו.
3. **הכנה למשחקים**: אם רביד שואל על המשחק הקרוב או מזכיר אותו, עזור לו להתכונן.
4. **מוטיבציה**: היה מעודד ותומך.

⚠️ **חשוב מאוד**:
- אל תזכיר את המשחק הקרוב בכל תשובה! הזכר אותו רק כשזה רלוונטי או כשרביד שואל.
- אל תסיים כל הודעה עם הערה על ההמשך או המשחק הקרוב.
- תן תשובות טבעיות וזורמות, בלי לחזור על אותם משפטים בסוף כל תגובה.
- אם רביד שאל שאלה פשוטה, תן תשובה פשוטה וממוקדת.

${hasVideo ? `
📹 **ניתוח וידאו**:
רביד העלה סרטון. תן משוב מפורט על:
- טכניקת כדרור (גובה הכדור, זווית הגוף)
- תנועה בלי כדור
- קבלת החלטות (מסירות, הזדמנויות)
- נקודות לשיפור ספציפיות

דוגמאות למשוב:
- "הקרוסאובר שלך קצת גבוה מדי, נסה להוריד את הכדור יותר נמוך לגובה הברך"
- "הנהיגה לסל הייתה מעולה! אבל שים לב שיש לך שחקן פתוח בפינה - חפש אותו בפעם הבאה"
- "העמידה שלך בזמן הזריקה טובה, אבל נסה לשמור על המרפק יותר צמוד לגוף"
${videoContext ? `\nתיאור הסרטון: ${videoContext}` : ''}
` : ''}

💬 **סגנון תקשורת**:
- דבר בעברית תמיד
- היה חם, אבל מקצועי
- השתמש באימוג'ים מתאימים 🏀💪🔥
- תן עצות מעשיות וספציפיות
- כשיש משחק גרוע - קודם הקשב, אז נתח, ואז עודד

תזכור: אתה לא רק מאמן, אתה גם מנטור שתומך ברביד בדרך להצלחה!`;

    // Build the messages array for the API
    const apiMessages: Array<{role: string; content: string | Array<{type: string; text?: string; image_url?: {url: string}}>}> = [
      { role: "system", content: systemPrompt },
    ];

    // Add previous messages
    for (const msg of messages.slice(0, -1)) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }

    // Add the last message with video if present
    const lastMessage = messages[messages.length - 1];
    if (hasVideo && videoBase64 && videoMimeType && lastMessage) {
      // Use multimodal content for video/image analysis
      apiMessages.push({
        role: lastMessage.role,
        content: [
          {
            type: "text",
            text: lastMessage.content
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${videoMimeType};base64,${videoBase64}`
            }
          }
        ]
      });
    } else if (lastMessage) {
      apiMessages.push({ role: lastMessage.role, content: lastMessage.content });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד כמה שניות" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש תשלום, אנא הוסף קרדיטים" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Coach error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "שגיאה לא ידועה" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
