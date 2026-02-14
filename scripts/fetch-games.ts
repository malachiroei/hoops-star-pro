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
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const games: any[] = [];

    // סריקת שורות הטבלה מהאתר
    $('.league-games-table tbody tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 5) return;

      const dateStr = $(cells[0]).text().trim(); // תאריך
      const timeStr = $(cells[1]).text().trim(); // שעה
      const homeTeam = $(cells[3]).text().trim(); // מארחת
      const awayTeam = $(cells[4]).text().trim(); // אורחת
      const score = $(cells[5]).text().trim(); // תוצאה (למשל 46-61)

      // עיבוד התאריך והשעה לפורמט של בסיס נתונים
      const [day, month, year] = dateStr.split('/');
      const isoDate = `20${year}-${month}-${day}T${timeStr}:00Z`;

      // פירוק התוצאה
      let homeScore = 0;
      let awayScore = 0;
      if (score.includes('-')) {
        [awayScore, homeScore] = score.split('-').map(s => parseInt(s.trim()));
      }

      games.push({
        game_date: isoDate,
        home_team: homeTeam,
        away_team: awayTeam,
        home_score: homeScore || 0,
        away_score: awayScore || 0,
        location: homeTeam.includes('בני יהודה') ? 'אולם קיבוץ גלויות' : 'אולם חוץ'
      });
    });

    console.log(`Found ${games.length} games. Updating database...`);

    // עדכון Supabase - מוחק ישנים ומכניס את כל לוח המשחקים המעודכן
    await supabase.from('games').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('games').insert(games);

    if (error) throw error;
    console.log('✅ Games updated successfully!');
  } catch (err) {
    console.error('❌ Error fetching games:', err);
  }
}

fetchLeagueGames();