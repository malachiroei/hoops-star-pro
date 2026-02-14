import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchLeagueGames() {
  try {
    // הלינק הישיר ללוח המשחקים
    const url = 'https://ibasketball.co.il/league/2025-270/#gsc.tab=0';
    console.log("Fetching data from:", url);
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const games: any[] = [];

    // איתור הטבלה לפי הסלקטור המדויק של אתר האיגוד
    $('.league-games-table tbody tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 6) return;

      const dateStr = $(cells[0]).text().trim(); // תאריך (למשל 13/11/25)
      const timeStr = $(cells[1]).text().trim(); // שעה (למשל 19:00)
      const homeTeam = $(cells[3]).text().trim(); // מארחת
      const awayTeam = $(cells[4]).text().trim(); // אורחת
      const score = $(cells[5]).text().trim();    // תוצאה (למשל 46 - 61)

      if (!homeTeam || !awayTeam) return;

      // המרת התאריך לפורמט שבסיס הנתונים מבין
      const dateParts = dateStr.split('/');
      const isoDate = `20${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeStr || '00:00'}:00Z`;

      // עיבוד תוצאה (הופך "61 - 46" למספרים נפרדים)
      let hScore = 0;
      let aScore = 0;
      if (score && score.includes('-')) {
        const parts = score.split('-').map(s => parseInt(s.trim()));
        // באתר האיגוד התוצאה כתובה משמאל לימין ביחס לקבוצות
        aScore = parts[0] || 0;
        hScore = parts[1] || 0;
      }

      games.push({
        game_date: isoDate,
        home_team: homeTeam,
        away_team: awayTeam,
        home_score: hScore,
        away_score: aScore,
        location: 'אולם ספורט' // ברירת מחדל
      });
    });

    if (games.length === 0) {
      console.log("❌ No games found! Checking selector...");
      return;
    }

    console.log(`✅ Found ${games.length} games. Syncing to Supabase...`);

    // מחיקת משחקים קיימים ועדכון מחדש של כל הליגה
    const { error: deleteError } = await supabase.from('games').delete().not('id', 'is', null);
    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase.from('games').insert(games);
    if (insertError) throw insertError;

    console.log('🚀 Database sync complete!');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

fetchLeagueGames();