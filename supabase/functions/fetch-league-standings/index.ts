import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

interface LeagueTeam {
  position: number;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  updatedAt: string;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Multiple URLs to try - direct standings link first
const LEAGUE_URLS = [
  "https://ibasketball.co.il/league/standings/1360",
  "https://ibasketball.co.il/",
  "https://ibasketball.co.il/league-standings/",
  "https://ibba.one.co.il/",
];

async function fetchFromUrl(url: string): Promise<string> {
  console.log(`Attempting to fetch from: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✅ Successfully fetched ${html.length} bytes`);
    
    // Log the body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;
    console.log(`\n📝 [HTML BODY] First 1000 chars of body:\n${bodyContent.substring(0, 1000)}\n`);
    
    return html;
  } catch (error) {
    console.warn(`Failed to fetch from ${url}:`, error.message);
    throw error;
  }
}

async function fetchLeagueStandings(): Promise<LeagueTeam[]> {
  let lastError: Error | null = null;
  let html: string | null = null;

  // Try each URL in sequence
  for (const url of LEAGUE_URLS) {
    try {
      html = await fetchFromUrl(url);
      console.log(`Successfully fetched from: ${url}`);
      break; // Success, exit loop
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt failed for ${url}`);
      // Continue to next URL
    }
  }

  if (!html) {
    throw new Error(
      `Could not fetch league standings from any source. Last error: ${lastError?.message}`
    );
  }

  try {
    const $ = cheerio.load(html);
    const standings: LeagueTeam[] = [];
    const now = new Date().toISOString();

    console.log(`\n📄 [DEBUG] HTML Body (first 1000 chars):\n${html.substring(0, 1000)}\n`);

    // Find ALL tables on page
    console.log(`📋 [TABLES] Scanning all tables on page...`);
    const allTables = $("table");
    console.log(`   Total tables found: ${allTables.length}`);

    // Log all tables first for debugging
    allTables.each((tableIndex, tableElement) => {
      const table = $(tableElement);
      const rowCount = table.find("tbody tr, tr").length;
      console.log(`   📌 TABLE ${tableIndex}: ${rowCount} rows, ID="${table.attr("id")}", Class="${table.attr("class")}"`);
    });

    // Now search for the table that contains 'בני יהודה'
    console.log(`\n🔍 [SEARCH] Looking for table containing 'בני יהודה'...`);
    let standingsTableIndex = -1;
    let standingsTable: any = null;

    allTables.each((tableIndex, tableElement) => {
      const table = $(tableElement);
      const allCellText = table.text();

      if (allCellText.includes("בני יהודה")) {
        console.log(`   ✅ Found 'בני יהודה' in TABLE ${tableIndex}!`);
        standingsTableIndex = tableIndex;
        standingsTable = table;
        return false; // break
      }
    });

    if (!standingsTable) {
      console.log(`   ❌ Could not find 'בני יהודה' in any table on the page`);
      console.log(`   Available text on page includes:`);
      allTables.each((idx, elem) => {
        const text = $(elem).text().substring(0, 200);
        console.log(`     Table ${idx}: "${text}"`);
      });
      throw new Error("Could not find standings table containing 'בני יהודה'");
    }

    console.log(`\n📊 [PARSING] Parsing table ${standingsTableIndex}...`);

    // Get headers for info
    const headerCells = standingsTable.find("thead tr th, thead tr td, tr:first th, tr:first td");
    const headerTexts: string[] = [];
    headerCells.each((_, cell) => {
      const headerText = $(cell).text().trim().substring(0, 40);
      headerTexts.push(headerText);
    });
    console.log(`   Headers: ${headerTexts.join(" | ")}`);

    // Parse all rows from the standings table
    const rows = standingsTable.find("tbody tr, tr");
    console.log(`   Found ${rows.length} rows total`);
    let parsedCount = 0;

    rows.each((rowIndex, element) => {
      const cells = $(element).find("td, th");
      
      if (cells.length < 2) return;

      const cellTexts = cells.map((_, cell) => $(cell).text().trim()).get();

      // Skip header rows
      if (cellTexts.length === 0) return;
      if (cellTexts[0].match(/^(מק"ט|#|מח"א|קבוצה|team)$/i)) return;

      // Try to detect if first column is a position number
      const firstColNum = parseInt(cellTexts[0]);
      
      if (firstColNum >= 1 && firstColNum <= 50) {
        const position = firstColNum;
        const name = cellTexts[1] || "";
        
        if (name && name.length > 1) {
          // Parse wins, losses, points from remaining columns
          let wins = 0;
          let losses = 0;
          let gamesPlayed = 0;
          let points = 0;

          // Try to find numeric columns
          const numericCols: number[] = [];
          for (let i = 2; i < cellTexts.length; i++) {
            const num = parseInt(cellTexts[i]);
            if (!isNaN(num)) {
              numericCols.push(num);
            }
          }

          // Assign based on number of numeric columns found
          if (numericCols.length >= 4) {
            // Position | Team | Games | W | L | Points (or similar)
            gamesPlayed = numericCols[0];
            wins = numericCols[1];
            losses = numericCols[2];
            points = numericCols[3];
          } else if (numericCols.length >= 3) {
            // Position | Team | W | L | Points
            wins = numericCols[0];
            losses = numericCols[1];
            points = numericCols[2];
            gamesPlayed = wins + losses;
          } else if (numericCols.length >= 2) {
            // Position | Team | W | L
            wins = numericCols[0];
            losses = numericCols[1];
            gamesPlayed = wins + losses;
          }

          standings.push({
            position,
            name,
            gamesPlayed,
            wins,
            losses,
            points,
            updatedAt: now,
          });
          parsedCount++;

          // Log all rows for verification
          console.log(`   [${position}] ${name.substring(0, 30)} | G=${gamesPlayed} W=${wins} L=${losses} P=${points}`);
        }
      }
    });

    if (standings.length === 0) {
      console.log(`\n❌ [ERROR] No standings parsed from table ${standingsTableIndex}`);
      throw new Error("Found standings table but could not parse any teams");
    }

    console.log(`\n✅ Successfully parsed ${standings.length} teams from standings table`);
    return standings;
  } catch (error) {
    console.error("Error parsing league standings:", error);
    throw error;
  }
}

async function updateLeagueStandings(standings: LeagueTeam[]) {
  try {
    // Delete old standings
    const { error: deleteError } = await supabase
      .from("league_standings")
      .delete()
      .neq("id", 0);

    if (deleteError && deleteError.code !== "PGRST116") {
      console.warn("Warning deleting old standings:", deleteError);
    }

    // Insert new standings
    const { error: insertError } = await supabase
      .from("league_standings")
      .insert(standings);

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log(`✅ Updated ${standings.length} teams in league standings`);
    return { success: true, count: standings.length };
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  }
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
    console.log("Starting league standings update...");
    const standings = await fetchLeagueStandings();
    const result = await updateLeagueStandings(standings);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.constructor.name : "Unknown",
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
