import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MealAnalysis {
  score: number;
  status: "green" | "yellow" | "red";
  feedback: string;
  proTip: string;
  details: {
    protein: boolean;
    carbs: boolean;
    vegetables: boolean;
  };
}

const proTips = [
  "זכור לשתות כוס מים גדולה יחד עם הארוחה",
  "נסה לאכול ארוחה קלה 3 שעות לפני המשחק",
  "הוסף בננה אחרי אימון - מקור מצוין לאשלגן",
  "שתייה מספקת משפרת את הריכוז במגרש",
  "חלבון אחרי אימון עוזר לשחזור השרירים",
  "פחמימות מורכבות נותנות אנרגיה לאורך זמן",
  "ירקות צבעוניים = ויטמינים מגוונים",
  "הימנע ממזון מטוגן לפני משחקים",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mealDescription, mealType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `אתה תזונאי ספורט מומחה לכדורסלנים צעירים. המשימה שלך היא לנתח ארוחות ולתת משוב בעברית.

עקרונות תזונה לכדורסלנים:
- חלבון (עוף, דגים, ביצים, קטניות) - חיוני לבניית שרירים ושחזור
- פחמימות מורכבות (אורז, פסטה, לחם מלא) - אנרגיה למשחקים ואימונים
- ירקות ופירות - ויטמינים ומינרלים לבריאות ותפקוד מיטבי

ענה בפורמט JSON בלבד עם המבנה הבא:
{
  "score": [מספר 1-10],
  "hasProtein": [true/false],
  "hasCarbs": [true/false],
  "hasVegetables": [true/false],
  "feedback": "[משוב קצר ומעודד בעברית]"
}

הערות:
- ציון 8-10: ארוחה מאוזנת עם חלבון, פחמימות וירקות
- ציון 5-7: ארוחה סבירה אבל חסר רכיב אחד
- ציון 1-4: ארוחה לא מאוזנת, חסרים מספר רכיבים
- התייחס לסוג הארוחה (לפני/אחרי משחק/אימון)`;

    const userPrompt = `נתח את הארוחה הבאה:
תיאור הארוחה: ${mealDescription || "ארוחה כללית"}
סוג הארוחה: ${mealType || "ארוחה רגילה"}

החזר את הניתוח בפורמט JSON.`;

    console.log("Calling AI gateway for meal analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד דקה" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "נדרש תשלום, הוסף קרדיטים לחשבון" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze meal");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    console.log("AI response:", aiResponse);

    // Parse AI response
    let parsedResponse;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      // Fallback response
      parsedResponse = {
        score: 7,
        hasProtein: true,
        hasCarbs: true,
        hasVegetables: false,
        feedback: "ארוחה טובה! המשך כך.",
      };
    }

    // Determine status based on score
    let status: "green" | "yellow" | "red";
    if (parsedResponse.score >= 8) {
      status = "green";
    } else if (parsedResponse.score >= 5) {
      status = "yellow";
    } else {
      status = "red";
    }

    // Select random pro tip
    const proTip = proTips[Math.floor(Math.random() * proTips.length)];

    const analysis: MealAnalysis = {
      score: parsedResponse.score,
      status,
      feedback: parsedResponse.feedback,
      proTip,
      details: {
        protein: parsedResponse.hasProtein,
        carbs: parsedResponse.hasCarbs,
        vegetables: parsedResponse.hasVegetables,
      },
    };

    console.log("Returning analysis:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-meal:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
