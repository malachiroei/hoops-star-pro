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

    // Find ALL tables and log their structure
    console.log(`📋 [TABLES] Scanning all tables on page...`);
    const allTables = $("table");
    console.log(`   Total tables found: ${allTables.length}`);

    allTables.each((tableIndex, tableElement) => {
      const table = $(tableElement);
      console.log(`\n   📌 TABLE ${tableIndex}:`);
      console.log(`      ID: "${table.attr("id")}"`);
      console.log(`      Class: "${table.attr("class")}"`);

      // Get header row
      const headerCells = table.find("thead tr th, thead tr td, tr:first th, tr:first td");
      console.log(`      Headers (${headerCells.length} columns):`);
      
      const headers: string[] = [];
      headerCells.each((colIndex, cell) => {
        const headerText = $(cell).text().trim().substring(0, 30);
        headers.push(headerText);
        console.log(`        [Col ${colIndex}]: "${headerText}"`);
      });

      // If no headers found in thead, try first row
      if (headers.length === 0) {
        const firstRow = table.find("tbody tr").first();
        if (firstRow.length > 0) {
          const firstRowCells = firstRow.find("td, th");
          console.log(`      First row (${firstRowCells.length} columns - may be data):`);
          firstRowCells.each((colIndex, cell) => {
            const cellText = $(cell).text().trim().substring(0, 30);
            console.log(`        [Col ${colIndex}]: "${cellText}"`);
          });
        }
      }

      // Count data rows
      const dataRows = table.find("tbody tr").length;
      console.log(`      Data rows: ${dataRows}`);
    });

    // Now try to parse the most likely table
    console.log(`\n🔍 [PARSING] Attempting to parse tables...`);
    
    allTables.each((tableIndex, tableElement) => {
      const table = $(tableElement);
      const rows = table.find("tbody tr");
      
      if (rows.length === 0) {
        console.log(`   ⚠️  Table ${tableIndex} has no tbody rows, skipping`);
        return;
      }

      // Get headers to identify if this is a standings or games table
      const headerCells = table.find("thead tr th, thead tr td, tr:first th, tr:first td");
      const headerTexts: string[] = [];
      headerCells.each((_, cell) => {
        headerTexts.push($(cell).text().trim().toLowerCase());
      });

      console.log(`   🔎 Table ${tableIndex} - Headers: ${headerTexts.join(", ")}`);

      // Skip games table (has מארחת or אורחת - host/visitor)
      const hasGamesTableMarkers = headerTexts.some(h => 
        h.includes("מארחת") || h.includes("אורחת") || h.includes("תאריך") || h.includes("שעה")
      );

      if (hasGamesTableMarkers) {
        console.log(`   ❌ Table ${tableIndex} is a GAMES table (has מארחת/אורחת), skipping`);
        return;
      }

      // Check if this looks like a STANDINGS table (has קבוצה or ניצחונות)
      const hasStandingsMarkers = headerTexts.some(h => 
        h.includes("קבוצה") || h.includes("ניצחונות") || h.includes("הפסדים") || 
        h.includes("נקודות") || h.includes("משחקים")
      );

      if (!hasStandingsMarkers && headerTexts.length > 0) {
        console.log(`   ⚠️  Table ${tableIndex} doesn't look like standings table, skipping`);
        return;
      }

      console.log(`   ✅ Table ${tableIndex} looks like STANDINGS table - parsing...`);
      let foundTeams = 0;

      rows.each((rowIndex, element) => {
        const cells = $(element).find("td");
        
        if (cells.length < 3) return;

        const cellTexts = cells.map((_, cell) => $(cell).text().trim()).get();
        
        // Try to detect if first column is a position number
        const firstColNum = parseInt(cellTexts[0]);
        
        if (firstColNum >= 1 && firstColNum <= 50) {
          const position = firstColNum;
          const name = cellTexts[1] || "";
          
          if (name && name.length > 1) {
            // Try to extract numbers from remaining cells
            let wins = 0;
            let losses = 0;
            let gamesPlayed = 0;
            let points = 0;

            // Parse remaining columns - try different column arrangements
            if (cellTexts.length >= 6) {
              // Try: Position | Team | Games | W | L | Points
              const col2 = parseInt(cellTexts[2]) || 0;
              const col3 = parseInt(cellTexts[3]) || 0;
              const col4 = parseInt(cellTexts[4]) || 0;
              const col5 = parseInt(cellTexts[5]) || 0;

              // Check if col2+col3=col4 (Games = W+L)
              if (col2 + col3 === col4) {
                wins = col2;
                losses = col3;
                gamesPlayed = col4;
                points = col5;
              } else {
                // Try alternate: Position | Team | W | L | Points | Games
                gamesPlayed = col2;
                wins = col3;
                losses = col4;
                points = col5;
              }
            } else if (cellTexts.length >= 5) {
              // Position | Team | W | L | Points
              wins = parseInt(cellTexts[2]) || 0;
              losses = parseInt(cellTexts[3]) || 0;
              points = parseInt(cellTexts[4]) || 0;
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
            foundTeams++;

            // Log first 3 teams found
            if (foundTeams <= 3) {
              console.log(`      ✓ Row ${rowIndex}: [${position}] ${name} | W=${wins} L=${losses} P=${points}`);
            }
          }
        }
      });

      if (foundTeams > 0) {
        console.log(`   ✅ Table ${tableIndex} yielded ${foundTeams} teams - SUCCESS!`);
      }
    });

    if (standings.length === 0) {
      console.log(`\n❌ [ERROR] No teams found in any table`);
      console.log(`Full HTML for analysis:\n${html}`);
      throw new Error("No league standings data found. Check logs for table structure.");
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
