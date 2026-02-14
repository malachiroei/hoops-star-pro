import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchLeagueGames() {
  try {
    console.log("🏀 מושך נתונים ישירות מה-API של איגוד הכדורסל...");
    
    // שליחת בקשה ישירה לשרת של האיגוד לקבלת לוח המשחקים של ליגה 270
    const response = await axios.post('https://ibasketball.co.il/wp-admin/admin-ajax.php', 
      new URLSearchParams({
        action: 'get_league_games',
        league_id: '270',
        season: '2025'
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    if (!response.data || !Array.isArray(response.data.games)) {
      throw new Error("השרת של האיגוד החזיר תשובה לא תקינה");
    }

    const games = response.data.games.map((g: any) => {
      // המרת התאריך לפורמט ISO תקין
      const [day, month, year] = g.date.split('/');
      const isoDate = `20${year}-${month}-${day}T${g.time || '00:00'}:00Z`;

      return {
        game_date: isoDate,
        home_team: g.home_team_name,
        away_team: g.away_team_name,
        home_score: parseInt(g.home_score) || 0,
        away_score: parseInt(g.away_score) || 0,
        location: g.hall_name || 'אולם ספורט'
      };
    });

    console.log(`✅ הצלחנו! נמצאו ${games.length} משחקים אמיתיים.`);

    // ניקוי ועדכון Supabase
    await supabase.from('games').delete().neq('home_team', 'TEMP_LOCK');
    const { error } = await supabase.from('games').insert(games);
    
    if (error) throw error;
    console.log("🚀 כל לוח המשחקים עודכן ב-Supabase!");

  } catch (err) {
    console.error("❌ תקלה בשליפת הנתונים:", err);
    process.exit(1);
  }
}

fetchLeagueGames();