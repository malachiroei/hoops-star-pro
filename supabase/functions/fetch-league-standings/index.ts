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

// Multiple URLs to try - one.co.il has better standings table
const LEAGUE_URLS = [
  "https://ibba.one.co.il/league/standings/1360",
  "https://ibba.one.co.il/",
  "https://ibasketball.co.il/league/standings/1360",
  "https://ibasketball.co.il/",
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

    console.log(`\n� [PARSING] Searching for standings table...`);

    // Find ALL tables on page
    const allTables = $("table");
    console.log(`   Found ${allTables.length} table(s) on page`);

    let foundStandingsTable = false;

    allTables.each((tableIndex, tableElement) => {
      if (foundStandingsTable) return; // Already found standings

      const table = $(tableElement);
      const rows = table.find("tbody tr, tr");
      
      console.log(`   📌 Table ${tableIndex}: ${rows.length} rows`);

      if (rows.length === 0) return;

      // Get header row - try different selectors
      let headerRow = table.find("thead tr").first();
      if (headerRow.length === 0) {
        headerRow = table.find("tr").first();
      }

      const headerCells = headerRow.find("th, td");
      const headers: string[] = [];
      
      headerCells.each((_, cell) => {
        const headerText = $(cell).text().trim();
        headers.push(headerText);
      });

      console.log(`      Headers: ${headers.join(" | ")}`);

      // Check if this is the standings table with expected headers
      // Looking for: מיקום (position), קבוצה (team), משחקים (games), נצ (wins), הפ (losses), נק (points)
      const headerStr = headers.join("|").toLowerCase();
      const isStandingsTable = 
        headerStr.includes("מיקום") && 
        headerStr.includes("קבוצה") && 
        (headerStr.includes("נצ") || headerStr.includes("ניצחון"));

      if (!isStandingsTable && headers.length > 0) {
        console.log(`      ⚠️  Not a standings table (missing expected headers)`);
        return;
      }

      if (isStandingsTable) {
        console.log(`      ✅ Found standings table!`);
      }

      // Find column indices for each field
      const positionIdx = headers.findIndex(h => h.trim() === "מיקום");
      const teamIdx = headers.findIndex(h => h.trim() === "קבוצה");
      const gamesIdx = headers.findIndex(h => h.trim() === "משחקים");
      const winsIdx = headers.findIndex(h => h.trim() === "נצ");
      const lossesIdx = headers.findIndex(h => h.trim() === "הפ");
      const pointsIdx = headers.findIndex(h => h.trim() === "נק");

      console.log(`      Column indices: P=${positionIdx} T=${teamIdx} G=${gamesIdx} W=${winsIdx} L=${lossesIdx} Pts=${pointsIdx}`);

      // Parse data rows
      let parsedCount = 0;
      rows.each((rowIndex, element) => {
        // Skip header row
        if (rowIndex === 0 && headerRow.get(0) === element) return;

        const cells = $(element).find("td, th");
        if (cells.length < 3) return;

        const cellTexts = cells.map((_, cell) => $(cell).text().trim()).get();

        // Try to get position from the first column
        let position = 0;
        let name = "";
        let gamesPlayed = 0;
        let wins = 0;
        let losses = 0;
        let points = 0;

        // Use column indices if found
        if (positionIdx >= 0 && teamIdx >= 0) {
          position = parseInt(cellTexts[positionIdx]) || 0;
          name = cellTexts[teamIdx] || "";
          
          if (gamesIdx >= 0) gamesPlayed = parseInt(cellTexts[gamesIdx]) || 0;
          if (winsIdx >= 0) wins = parseInt(cellTexts[winsIdx]) || 0;
          if (lossesIdx >= 0) losses = parseInt(cellTexts[lossesIdx]) || 0;
          if (pointsIdx >= 0) points = parseInt(cellTexts[pointsIdx]) || 0;
        } else {
          // Fallback: assume standard column order
          position = parseInt(cellTexts[0]) || 0;
          name = cellTexts[1] || "";
          gamesPlayed = parseInt(cellTexts[2]) || 0;
          wins = parseInt(cellTexts[3]) || 0;
          losses = parseInt(cellTexts[4]) || 0;
          points = parseInt(cellTexts[5]) || 0;
        }

        // Only add if position looks valid
        if (position >= 1 && position <= 50 && name && name.length > 1) {
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

          // Log each team
          console.log(`      [${position}] ${name.substring(0, 35)} | G=${gamesPlayed} W=${wins} L=${losses} P=${points}`);
        }
      });

      console.log(`      ✅ Parsed ${parsedCount} teams from this table`);

      if (parsedCount > 0) {
        foundStandingsTable = true;
      }
    });

    if (standings.length === 0) {
      console.log(`\n❌ [ERROR] No standings found in any table`);
      throw new Error("Could not parse standings table");
    }

    console.log(`\n✅ Successfully parsed ${standings.length} teams total`);
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
