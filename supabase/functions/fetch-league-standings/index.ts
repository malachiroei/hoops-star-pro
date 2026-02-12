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

async function fetchLeagueStandings(): Promise<LeagueTeam[]> {
  try {
    const response = await fetch(
      "https://ibasketball.co.il/team/5458-%D7%91%D7%A0%D7%99-%D7%99%D7%94%D7%95%D7%93%D7%94-%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91/"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch standings: ${response.statusText}`);
    }

    const html = await response.text();
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

    return standings;
  } catch (error) {
    console.error("Error fetching league standings:", error);
    throw error;
  }
}

async function updateLeagueStandings(standings: LeagueTeam[]) {
  try {
    // Delete old standings
    await supabase.from("league_standings").delete().select();

    // Insert new standings
    const { error } = await supabase
      .from("league_standings")
      .insert(standings);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Updated ${standings.length} teams in league standings`);
    return { success: true, count: standings.length };
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  }
}

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
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
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
