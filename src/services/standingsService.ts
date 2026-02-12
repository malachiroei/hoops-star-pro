import * as cheerio from 'cheerio';
import { supabase } from '@/integrations/supabase/client';

export interface ParsedTeam {
  name: string;
  position: number;
  points: number;
  games_played: number;
}

const STANDINGS_URL = 'https://ibasketball.co.il/league/2025-270/';
const HEADER_KEYWORDS = ['מיקום', 'קבוצה', 'ball', 'team', 'time', 'date', 'header'];

/**
 * Fetch standings HTML from IBBA website
 */
async function fetchStandingsHtml(): Promise<string> {
  console.log('🌐 [Client] Fetching standings from:', STANDINGS_URL);

  try {
    const response = await fetch(STANDINGS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://ibasketball.co.il/',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✅ [Client] HTML fetched successfully (${html.length} bytes)`);

    return html;
  } catch (error) {
    console.error('❌ [Client] Failed to fetch standings:', error);
    throw error;
  }
}

/**
 * Parse HTML table and extract team data using cheerio
 * Cell mapping (verified from logs):
 * cells[0] = position
 * cells[1] = points
 * cells[8] = games_played
 * cells[10] = team name
 */
function parseStandingsHtml(html: string): ParsedTeam[] {
  console.log('\n📋 [Client] Parsing standings table...');
  const teams: ParsedTeam[] = [];

  try {
    const $ = cheerio.load(html);
    const rows = $('tr').toArray();

    console.log(`📊 [Client] Found ${rows.length} total table rows`);

    rows.forEach((row, rowIndex) => {
      const cells = $(row).find('td, th').toArray();
      const cellTexts = cells.map((cell) => $(cell).text().trim());

      // Process rows with 10+ cells
      if (cellTexts.length < 10) {
        return;
      }

      console.log(`DEBUG ROW ${rowIndex}: cells=${cellTexts.length} | ${cellTexts.join(' | ')}`);

      // Extract data using exact cell mapping
      const teamName = (cellTexts[10] || '').trim();
      const position = parseInt(cellTexts[0]);
      const points = parseInt(cellTexts[1]);
      const gamesPlayed = parseInt(cellTexts[8]);

      // Skip empty team names
      if (!teamName) {
        console.log(`  -> Skipping: no team name`);
        return;
      }

      // Skip header rows
      const isHeaderRow = HEADER_KEYWORDS.some(keyword =>
        teamName.toLowerCase().includes(keyword.toLowerCase())
      );
      if (isHeaderRow) {
        console.log(`  -> Skipping: header row "${teamName}"`);
        return;
      }

      // Validate parsed data
      if (isNaN(position) || isNaN(points) || isNaN(gamesPlayed)) {
        console.log(`  -> Skipping: invalid numeric data`);
        return;
      }

      teams.push({
        name: teamName,
        position,
        points,
        games_played: gamesPlayed
      });

      console.log(`  -> ✅ Parsed: "${teamName}" [pos=${position}, pts=${points}, games=${gamesPlayed}]`);
    });

    console.log(`\n📊 [Client] Parsing complete: ${teams.length} teams extracted`);
    return teams;
  } catch (error) {
    console.error('❌ [Client] Error parsing standings:', error);
    throw error;
  }
}

/**
 * Save parsed teams to Supabase using upsert
 */
async function saveToDatabase(teams: ParsedTeam[]): Promise<number> {
  console.log(`\n💾 [Client] Saving ${teams.length} teams to Supabase...`);
  console.log(`   URL: https://ibasketball.co.il/league/2025-270/ ✓`);

  if (teams.length === 0) {
    console.log('   No teams to save');
    return 0;
  }

  let savedCount = 0;

  for (const team of teams) {
    try {
      console.log(`\n  -> Attempting to save: "${team.name}"`);
      console.log(`     Data: { name: "${team.name}", position: ${team.position}, points: ${team.points}, games_played: ${team.games_played} }`);

      const { error } = await supabase
        .from('league_standings')
        .upsert(
          [{
            name: team.name,
            position: team.position,
            points: team.points,
            games_played: team.games_played,
            updatedAt: new Date().toISOString()
          }],
          { onConflict: 'name' }
        );

      if (error) {
        console.error(`  -> UPSERT ERROR: ${error.message}`);
        console.error(`     Code: ${error.code}`);
        console.error(`     Details: ${JSON.stringify(error)}`);
      } else {
        console.log(`  -> ✅ UPSERT SUCCESS: "${team.name}" saved to DB`);
        savedCount++;
      }
    } catch (err) {
      console.error(`  -> EXCEPTION: ${err}`);
    }
  }

  console.log(`\n✅ [Client] Save complete: ${savedCount}/${teams.length} teams saved`);
  return savedCount;
}

/**
 * Main function: Fetch, parse, and save league standings
 */
export async function scrapeAndSaveStandings(): Promise<number> {
  console.log('🏀 [Client] LEAGUE STANDINGS UPDATE - ' + new Date().toISOString());
  console.log('─'.repeat(60));

  try {
    // Step 1: Fetch HTML
    const html = await fetchStandingsHtml();

    // Step 2: Parse standings
    const teams = parseStandingsHtml(html);

    // Step 3: Save to database
    const savedCount = await saveToDatabase(teams);

    console.log('─'.repeat(60));
    console.log(`✅ UPDATE COMPLETE: ${savedCount} teams saved to database`);

    return savedCount;
  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
    throw error;
  }
}
