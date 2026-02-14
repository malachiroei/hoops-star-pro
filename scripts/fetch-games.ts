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
    console.log("🏀 שולף נתונים מהאיגוד...");
    
    // שליחת בקשה עם התחזות מלאה לדפדפן כדי לעקוף חסימות API
    const { data } = await axios.get(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const games: any[] = [];

    // איתור כל שורה שיש לה מבנה של משחק (תאריך, שעה, קבוצות)
    $('tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 5) return;

      const dateText = $(cells[0]).text().trim();
      const timeText = $(cells[1]).text().trim();
      const homeTeam = $(cells[3]).text().trim();
      const awayTeam = $(cells[4]).text().trim();
      const scoreText = $(cells[5]).text().trim();

      // וודא שמדובר בשורת נתונים אמיתית (תאריך בפורמט dd/mm/yy)
      if (!dateText.includes('/') || !homeTeam) return;

      const parts = dateText.split('/');
      const isoDate = `20${parts[2]}-${parts[1]}-${parts[0]}T${timeText || '00:00'}:00Z`;

      let hScore = 0, aScore = 0;
      if (scoreText.includes('-')) {
        const scoreParts = scoreText.split('-').map(s => parseInt(s.trim()));
        aScore = scoreParts[0] || 0;
        hScore = scoreParts[1] || 0;
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
      throw new Error("הדף נטען אבל הטבלה לא חולצה. נסה שוב.");
    }

    console.log(`✅ הצלחנו! נמצאו ${games.length} משחקים.`);

    // ניקוי ועדכון Supabase
    await supabase.from('games').delete().neq('home_team', 'FORCE_CLEAN');
    const { error } = await supabase.from('games').insert(games);
    
    if (error) throw error;
    console.log("🚀 כל המשחקים סונכרנו ל-Supabase!");

  } catch (err) {
    console.error("❌ תקלה:", err.message);
    process.exit(1);
  }
}

fetchLeagueGames();