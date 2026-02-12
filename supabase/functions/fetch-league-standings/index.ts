import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const STANDINGS_URL = "https://ibasketball.co.il/league/2025-270/";
const HEADER_KEYWORDS = ['מיקום', 'קבוצה', 'ball', 'team', 'time', 'date', 'header'];


async function fetchStandingsHtml(): Promise<string> {
  console.log(`🌐 Fetching standings from: ${STANDINGS_URL}`);
  
  try {
    const response = await fetch(STANDINGS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://ibasketball.co.il/",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorBody.substring(0, 500)}`);
    }

    const html = await response.text();
    console.log(`✅ HTML fetched successfully (${html.length} bytes)`);
    
    return html;
  } catch (error) {
    console.error(`❌ Failed to fetch standings:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

async function parseAndSaveStandings(html: string): Promise<number> {
  console.log(`\n📋 Parsing standings table...`);
  let teamsSaved = 0;
  let teamsSkipped = 0;

  try {
    const $ = cheerio.load(html);
    const rows = $('tr').toArray();
    
    console.log(`📊 Found ${rows.length} total table rows`);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const cells = $(rows[rowIndex]).find('td, th').toArray();
      const cellTexts = cells.map((cell) => $(cell).text().trim());

      // Process rows with 10+ cells (no strict validation)
      if (cellTexts.length < 10) {
        continue;
      }

      // Emergency debug: log raw cell values
      console.log('DEBUG ROW ' + rowIndex + ': cells=' + cellTexts.length + ' | ' + cellTexts.join(' | '));

      // Manual indexing - EXACT MAPPING
      const teamName = (cellTexts[10] || '').trim();
      const pos = parseInt(cellTexts[0]);
      const pts = parseInt(cellTexts[1]);
      const played = parseInt(cellTexts[8]);

      // Skip only if no team name at all
      if (!teamName) {
        console.log('  -> Skipping: no team name');
        continue;
      }

      // Skip header rows
      const isHeaderRow = HEADER_KEYWORDS.some(keyword => 
        teamName.toLowerCase().includes(keyword.toLowerCase())
      );
      if (isHeaderRow) {
        console.log('  -> Skipping: header row');
        continue;
      }

      // Force UPSERT with result logging
      try {
        console.log(`  -> Attempting to save: name="${teamName}", pos=${pos}, pts=${pts}, played=${played}`);
        
        const { data, error } = await supabase
          .from('league_standings')
          .upsert(
            [{
              name: teamName,
              position: pos,
              points: pts,
              games_played: played,
              updatedAt: new Date().toISOString()
            }],
            { onConflict: 'name' }
          );

        if (error) {
          console.error(`  -> UPSERT ERROR: ${error.message}`);
        } else {
          console.log(`  -> ✅ UPSERT SUCCESS: "${teamName}" saved to DB`);
          teamsSaved++;
        }
      } catch (err) {
        console.error(`  -> EXCEPTION: ${err}`);
      }
    }

    console.log(`\n📊 PARSING COMPLETE`);
    console.log(`   ✅ Teams saved: ${teamsSaved}`);
    console.log(`   ⏭️  Teams skipped: ${teamsSkipped}`);
  } catch (error) {
    console.error(`❌ Error parsing standings:`, error instanceof Error ? error.message : String(error));
    throw error;
  }

  return teamsSaved;
}

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`🏀 LEAGUE STANDINGS UPDATE - ${new Date().toISOString()}`);
    console.log(`${"─".repeat(60)}\n`);

    // Step 1: Fetch HTML
    const html = await fetchStandingsHtml();

    // Step 2: Parse and save standings (immediate upsert in loop)
    const teamsSaved = await parseAndSaveStandings(html);

    console.log(`\n${"─".repeat(60)}`);
    console.log(`✅ UPDATE COMPLETE: ${teamsSaved} teams updated in database`);
    console.log(`${"─".repeat(60)}\n`);

    return new Response(JSON.stringify({
      success: true,
      teams_saved: teamsSaved,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`\n❌ FATAL ERROR:`, error instanceof Error ? error.message : String(error));
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});