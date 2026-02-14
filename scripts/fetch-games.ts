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
    console.log("🏀 מתחיל סריקה עמוקה מהכתובת:", url);
    
    // שליחת בקשה עם Header של דפדפן כדי לא להיחסם
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const games: any[] = [];

    // סריקה של כל הטבלאות בדף (למקרה שיש כמה)
    $('table tr').each((_, el) => {
      const cells = $(el).find('td');
      
      // אנחנו מחפשים שורות עם לפחות 5 עמודות (תאריך, שעה, מארחת, אורחת, תוצאה)
      if (cells.length >= 5) {
        const dateStr = $(cells[0]).text().trim();
        const timeStr = $(cells[1]).text().trim();
        const homeTeam = $(cells[3]).text().trim();
        const awayTeam = $(cells[4]).text().trim();
        const scoreStr = $(cells[5]).text().trim();

        // דילוג על שורות כותרת או שורות ריקות
        if (!homeTeam || homeTeam === 'מארחת' || !dateStr.includes('/')) return;

        // עיבוד תאריך ושעה
        const [day, month, year] = dateStr.split('/');
        const isoDate = `20${year}-${month}-${day}T${timeStr || '00:00'}:00Z`;

        // עיבוד תוצאה
        let hScore = 0, aScore = 0;
        if (scoreStr.includes('-')) {
          const parts = scoreStr.split('-').map(s => parseInt(s.trim()));
          // באתר האיגוד התוצאה מוצגת בד"כ כ "אורחת - מארחת"
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
      }
    });

    console.log(`🔍 סריקה הושלמה. נמצאו ${games.length} משחקים בטבלה.`);

    if (games.length === 0) {
      throw new Error("לא נמצאו משחקים בטבלה. ייתכן שנדרש דפדפן מלא לסריקה.");
    }

    // עדכון Supabase
    const { error: delErr } = await supabase.from('games').delete().not('id', 'is', null);
    const { error: insErr } = await supabase.from('games').insert(games);
    
    if (insErr) throw insErr;
    console.log("🚀 טבלת המשחקים ב-Supabase עודכנה בהצלחה!");

  } catch (err) {
    console.error("❌ תקלה:", err.message);
    process.exit(1);
  }
}

fetchLeagueGames();