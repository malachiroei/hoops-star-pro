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

// Multiple URLs to try (primary and alternatives with different domains/protocols)
const LEAGUE_URLS = [
  "https://ibasketball.co.il/team/5458-%D7%91%D7%A0%D7%99-%D7%99%D7%94%D7%95%D7%93%D7%94-%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91/",
  "https://ibba.one.co.il/team/5458-%D7%91%D7%A0%D7%99-%D7%99%D7%94%D7%95%D7%93%D7%94-%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91/",
  "http://ibasketball.co.il/team/5458-%D7%91%D7%A0%D7%99-%D7%99%D7%94%D7%95%D7%93%D7%94-%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91/",
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

    return await response.text();
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

    // Parse the league table - look for table rows with team data
    // The table structure: position | team name | games played | wins | losses | points
    $("table tbody tr").each((index, element) => {
      const cells = $(element).find("td");

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
        }
      }
    });

    if (standings.length === 0) {
      throw new Error("No league standings data found in HTML. Table structure may have changed.");
    }

    console.log(`Successfully parsed ${standings.length} teams from league table`);
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
