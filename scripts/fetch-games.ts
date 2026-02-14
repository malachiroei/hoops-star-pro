import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchLeagueGames() {
  try {
    const url = 'https://ibasketball.co.il/league/2025-270/#gsc.tab=0';
    console.log("🏀 מתחיל סריקה מהכתובת:", url);
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const games: any[] = [];

    // נסיון למצוא את שורות הטבלה לפי כמה סלקטורים אפשריים
    const rows = $('.league-games-table tbody tr, table tr').filter((_, el) => {
      return $(el).find('td').length >= 5;
    });

    console.log(`🔍 נמצאו ${rows.length} שורות פוטנציאליות בטבלה`);

    rows.each((_, el) => {
      const cells = $(el).find('td');
      
      const dateStr = $(cells[0]).text().trim();
      const timeStr = $(cells[1]).text().trim();
      const homeTeam = $(cells[3]).text().trim();
      const awayTeam = $(cells[4]).text().trim();
      const score = $(cells[5]).text().trim();

      if (!homeTeam || !awayTeam || homeTeam === 'מארחת') return;

      // המרת תאריך
      const dateParts = dateStr.split('/');
      if (dateParts.length < 3) return;
      const isoDate = `20${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeStr || '00:00'}:00Z`;

      let hScore = 0, aScore = 0;
      if (score.includes('-')) {
        const parts = score.split('-').map(s => parseInt(s.trim()));
        aScore = parts[0] || 0;
        hScore = parts[1] || 0;
      }

      games.push({
        game_date: isoDate,
        home_team: homeTeam,
        away_team: awayTeam,
        home_score: hScore,
        away_score: aScore,
        location: 'אולם ספורט'
      });
    });

    if (games.length === 0) {
      throw new Error("לא נמצאו משחקים! ייתכן שהסלקטור של הטבלה השתנה.");
    }

    console.log(`✅ נמצאו ${games.length} משחקים. מעדכן את Supabase...`);

    // מחיקה והכנסה מחדש
    const { error: delErr } = await supabase.from('games').delete().not('id', 'is', null);
    if (delErr) console.error("שגיאה במחיקה:", delErr);

    const { error: insErr } = await supabase.from('games').insert(games);
    if (insErr) throw insErr;

    console.log("🚀 הסנכרון הסתיים בהצלחה!");
  } catch (err) {
    console.error("❌ תקלה קריטית:", err);
    process.exit(1); // גורם ל-GitHub Action להיכשל אם אין נתונים
  }
}

fetchLeagueGames();