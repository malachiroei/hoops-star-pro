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

// Multiple URLs to try (primary and alternatives)
const LEAGUE_URLS = [
  "https://ibasketball.co.il/team/5458-%D7%91%D7%A0%D7%99-%D7%99%D7%94%D7%95%D7%93%D7%94-%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91/",
  "https://ibba.one.co.il/team/5458-%D7%91%D7%A0%D7%99-%D7%99%D7%94%D7%95%D7%93%D7%94-%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91/",
  "http://ibasketball.co.il/team/5458-%D7%91%D7%A0%D7%99-%D7%99%D7%94%D7%95%D7%93%D7%94-%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91/",
];

async function fetchFromUrl(url: string): Promise<string> {
  console.log(`Attempting to fetch from: ${url}`);
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.warn(`Failed to fetch from ${url}:`, error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLeagueStandings(): Promise<LeagueTeam[]> {
  console.log("Fetching league standings from ibasketball.co.il...");
  
  let lastError: Error | null = null;
  let html: string | null = null;

  // Try each URL in sequence
  for (const url of LEAGUE_URLS) {
    try {
      html = await fetchFromUrl(url);
      console.log(`✅ Successfully fetched from: ${url}`);
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

    if (standings.length === 0) {
      throw new Error("No league standings data found in HTML. Table structure may have changed.");
    }

    console.log(`✅ Successfully parsed ${standings.length} teams from league table`);
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

    console.log(`✅ Successfully updated ${standings.length} teams in database`);
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
