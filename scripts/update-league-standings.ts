import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import * as cron from "node-cron";

interface LeagueTeam {
  position: number;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  updatedAt: string;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchLeagueStandings(): Promise<LeagueTeam[]> {
  try {
    console.log("Fetching league standings from ibasketball.co.il...");
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

    // Parse the league table
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

    console.log(`Successfully fetched ${standings.length} teams`);
    return standings;
  } catch (error) {
    console.error("Error fetching league standings:", error);
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

    if (deleteError) {
      console.error("Error deleting old standings:", deleteError);
    }

    // Insert new standings
    const { error: insertError } = await supabase
      .from("league_standings")
      .insert(standings);

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log(`Successfully updated ${standings.length} teams in database`);
    return { success: true, count: standings.length, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  }
}

async function runUpdate() {
  try {
    console.log(`\n📅 Running league update at ${new Date().toISOString()}`);
    const standings = await fetchLeagueStandings();
    const result = await updateLeagueStandings(standings);
    console.log("✅ Update completed:", result);
  } catch (error) {
    console.error("❌ Update failed:", error);
  }
}

// Schedule the cron job to run every 24 hours (at 3 AM)
const schedule = "0 3 * * *";
console.log(`🕐 Cron job scheduled: ${schedule} (Every day at 3 AM UTC)`);
console.log("Press Ctrl+C to stop");

cron.schedule(schedule, runUpdate);

// Run immediately on startup for testing
console.log("Running initial update...");
runUpdate().catch(console.error);
