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

    // Log document structure
    console.log(`📋 [STRUCTURE] Looking for tables...`);
    const allTables = $("table");
    console.log(`   Found ${allTables.length} <table> elements total`);

    // Try to find table with ID leagueStandings
    console.log(`🎯 [SELECTOR] Trying: table#leagueStandings`);
    let leagueTable = $("#leagueStandings");
    console.log(`   Result: ${leagueTable.length} elements found`);

    // If not found by ID, try by class
    if (leagueTable.length === 0) {
      console.log(`🎯 [SELECTOR] Trying: table[class*="standings"]`);
      leagueTable = $("table[class*='standings']");
      console.log(`   Result: ${leagueTable.length} elements found`);
    }

    // If still not found, try common selectors
    if (leagueTable.length === 0) {
      console.log(`🎯 [SELECTOR] Trying: .leagueStandings, .league-standings, .standings-table`);
      leagueTable = $(".leagueStandings, .league-standings, .standings-table");
      console.log(`   Result: ${leagueTable.length} elements found`);
    }

    // If still nothing, use first table as fallback
    if (leagueTable.length === 0) {
      console.log(`⚠️  [FALLBACK] Using first table on page`);
      leagueTable = $("table").first();
      if (leagueTable.length > 0) {
        console.log(`   Found table with id="${leagueTable.attr("id")}" class="${leagueTable.attr("class")}"`);
      }
    }

    // Parse the league table
    const rows = leagueTable.find("tbody tr, tr");
    console.log(`📊 [ROWS] Found ${rows.length} rows in selected table`);

    if (rows.length === 0) {
      console.log(`❌ No rows found. Showing table HTML:`);
      console.log(leagueTable.html()?.substring(0, 500));
    }

    rows.each((index, element) => {
      const cells = $(element).find("td, th");

      if (cells.length >= 6) {
        const position = parseInt($(cells[0]).text().trim()) || 0;
        const name = $(cells[1]).text().trim();
        const gamesPlayed = parseInt($(cells[2]).text().trim()) || 0;
        const wins = parseInt($(cells[3]).text().trim()) || 0;
        const losses = parseInt($(cells[4]).text().trim()) || 0;
        const points = parseInt($(cells[5]).text().trim()) || 0;

        if (name && position > 0) {
          standings.push({
            position,
            name,
            gamesPlayed,
            wins,
            losses,
            points,
            updatedAt: now,
          });

          // Log first few rows
          if (standings.length <= 3) {
            console.log(`   ✓ Row ${index}: [${position}] ${name} | G=${gamesPlayed} W=${wins} L=${losses} P=${points}`);
          }
        }
      }
    });

    if (standings.length === 0) {
      throw new Error("No league standings data found in HTML. Check logs for table structure.");
    }

    console.log(`\n✅ Successfully parsed ${standings.length} teams from league table`);
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
