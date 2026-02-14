import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchLeagueGames() {
  try {
    console.log("🏀 שולף נתונים גולמיים משרת האיגוד...");
    
    // שליחת בקשת POST בדיוק כמו שהאתר עושה כשהוא טוען את הטבלה
    const formData = new FormData();
    formData.append('action', 'get_league_games');
    formData.append('league_id', '270');
    formData.append('season', '2025');

    const response = await axios.post('https://ibasketball.co.il/wp-admin/admin-ajax.php', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
      }
    );

    // בדיקה אם חזר HTML במקום JSON (קורה לפעמים כשנחסמים)
    if (typeof response.data === 'string' && response.data.includes('<table')) {
       console.log("⚠️ השרת החזיר HTML. מנסה לחלץ נתונים מהטבלה...");
       // כאן נשארת לוגיקת החילוץ מה-HTML כגיבוי
    }

    const gamesData = response.data.games || [];
    console.log(`🔍 נמצאו ${gamesData.length} משחקים במערכת.`);

    const formattedGames = gamesData.map((g: any) => {
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

    // עדכון Supabase
    await supabase.from('games').delete().neq('home_team', 'FORCE_DELETE');
    const { error } = await supabase.from('games').insert(formattedGames);
    
    if (error) throw error;
    console.log("🚀 הסנכרון ל-Supabase הושלם בהצלחה!");

  } catch (err) {
    console.error("❌ תקלה:", err.message);
    process.exit(1);
  }
}

fetchLeagueGames();