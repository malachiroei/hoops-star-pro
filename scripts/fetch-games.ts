import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import qs from 'qs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchLeagueGames() {
  try {
    console.log("🏀 מושך נתונים מליגה 270 (ילדים א' תל אביב)...");
    
    // שימוש ב-URLSearchParams כדי לדמות שליחת טופס דפדפן מדויקת
    const data = qs.stringify({
      'action': 'get_league_games',
      'league_id': '270',
      'season': '2025' 
    });

    const response = await axios.post('https://ibasketball.co.il/wp-admin/admin-ajax.php', data, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.data || !response.data.games) {
      console.log("Response data:", response.data);
      throw new Error("השרת לא החזיר רשימת משחקים.");
    }

    const games = response.data.games.map((g: any) => {
      const [day, month, year] = g.date.split('/');
      return {
        game_date: `20${year}-${month}-${day}T${g.time || '00:00'}:00Z`,
        home_team: g.home_team_name,
        away_team: g.away_team_name,
        home_score: parseInt(g.home_score) || 0,
        away_score: parseInt(g.away_score) || 0,
        location: g.hall_name || 'אולם ספורט'
      };
    });

    console.log(`✅ הצלחנו! נמצאו ${games.length} משחקים.`);

    // ניקוי והכנסה ל-Supabase
    await supabase.from('games').delete().neq('home_team', 'CLEANUP');
    const { error } = await supabase.from('games').insert(games);
    
    if (error) throw error;
    console.log("🚀 טבלת המשחקים עודכנה בהצלחה!");

  } catch (err) {
    console.error("❌ תקלה:", err.message);
    process.exit(1);
  }
}

fetchLeagueGames();