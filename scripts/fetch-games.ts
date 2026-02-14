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
    console.log("🏀 שולף נתונים מהאיגוד באותה שיטה של הטבלה...");
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const games: any[] = [];

    // אנחנו מחפשים את שורות הטבלה של המשחקים
    $('tr').each((_, el) => {
      const cells = $(el).find('td');
      
      // וודא שזו שורת משחק (לפחות 5 עמודות)
      if (cells.length >= 6) {
        const dateStr = $(cells[0]).text().trim();
        const timeStr = $(cells[1]).text().trim();
        const homeTeam = $(cells[3]).text().trim();
        const awayTeam = $(cells[4]).text().trim();
        const scoreStr = $(cells[5]).text().trim();

        if (!dateStr.includes('/') || !homeTeam) return;

        // המרת תאריך
        const [day, month, year] = dateStr.split('/');
        const isoDate = `20${year}-${month}-${day}T${timeStr || '00:00'}:00Z`;

        // פירוק תוצאה
        let hScore = 0, aScore = 0;
        if (scoreStr.includes('-')) {
          const parts = scoreStr.split('-').map(s => parseInt(s.trim()));
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

    if (games.length === 0) {
      throw new Error("לא נמצאו משחקים. ייתכן שהאתר חוסם סריקה פשוטה.");
    }

    console.log(`✅ הצלחנו! נמצאו ${games.length} משחקים.`);

    // עדכון Supabase
    await supabase.from('games').delete().neq('home_team', 'FORCE_CLEAN');
    const { error } = await supabase.from('games').insert(games);
    
    if (error) throw error;
    console.log("🚀 לוח המשחקים עודכן בהצלחה!");

  } catch (err) {
    console.error("❌ תקלה:", err.message);
    process.exit(1);
  }
}

fetchLeagueGames();