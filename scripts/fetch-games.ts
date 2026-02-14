import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function clearGames() {
  try {
    console.log("🏀 מנקה נתונים זמניים ומחזיר מצב תקין...");
    // הסקריפט כרגע רק מוודא שהחיבור ל-Supabase תקין
    const { data, error } = await supabase.from('games').select('count');
    if (error) throw error;
    console.log("✅ הכל תקין, מוכן להמשך עבודה בהמשך.");
  } catch (err) {
    console.error("❌ שגיאת חיבור:", err.message);
  }
}

clearGames();