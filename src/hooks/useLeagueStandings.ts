import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { scrapeAndSaveStandings } from "@/services/standingsService";

export interface LeagueTeam {
  id: number;
  position: number;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  updatedAt: string;
}

export function useLeagueStandings() {
  return useQuery({
    queryKey: ["league-standings"],
    queryFn: async (): Promise<LeagueTeam[]> => {
      const { data, error } = await supabase
        .from("league_standings")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        console.error("[useLeagueStandings] Error fetching standings:", error.message);
        throw new Error(error.message);
      }

      // Log the actual row count received from DB
      console.log(`[useLeagueStandings] ✅ Fetched ${data?.length || 0} teams from database`);
      if (data && data.length > 0) {
        console.log(`   First team: ${data[0].name} (position ${data[0].position})`);
        console.log(`   Last team: ${data[data.length - 1].name} (position ${data[data.length - 1].position})`);
      }

      return data || [];
    },
    staleTime: 0, // Force fresh fetch every time
    gcTime: 0, // Don't cache
    refetchOnWindowFocus: true, // Auto-refresh when user returns to window
  });
}

/**
 * Client-side scraping: Fetch from IBBA, parse, and save directly to Supabase
 * Bypasses Edge Function which may be blocked by firewall
 * Use this in non-component contexts
 */
export async function triggerLeagueUpdate() {
  try {
    console.log("\n" + "═".repeat(60));
    console.log("📲 [Hook] Triggering client-side standings scrape...");
    console.log("   URL: https://ibasketball.co.il/league/2025-270/ ✓");
    console.log("═".repeat(60));
    
    // Use client-side scraping instead of Edge Function
    const savedCount = await scrapeAndSaveStandings();
    
    console.log("\n" + "═".repeat(60));
    console.log(`✅ [Hook] Successfully scraped and saved ${savedCount} teams`);
    console.log("═".repeat(60));
    
    // Log DB success
    console.log("\n📋 DB Update Result: SUCCESS");
    console.log(`   Teams saved: ${savedCount}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log("   Note: Refresh the page to see updated standings in UI");
    
    return {
      success: true,
      teams_saved: savedCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\n" + "═".repeat(60));
    console.error("❌ DB Update Failed!");
    console.error(`   Error: ${errorMessage}`);
    console.error("═".repeat(60));
    throw error;
  }
}

/**
 * Hook version with React Query invalidation
 * Use this in React components for automatic UI refresh
 */
export function useTriggerLeagueUpdate() {
  const queryClient = useQueryClient();

  return async () => {
    try {
      console.log("\n" + "═".repeat(60));
      console.log("📲 [useHook] Triggering client-side standings scrape...");
      console.log("   URL: https://ibasketball.co.il/league/2025-270/ ✓");
      console.log("═".repeat(60));
      
      // Use client-side scraping
      const savedCount = await scrapeAndSaveStandings();
      
      console.log("\n" + "═".repeat(60));
      console.log(`✅ [useHook] Successfully scraped and saved ${savedCount} teams`);
      console.log(`   Invalidating React Query cache for instant UI refresh...`);
      console.log("═".repeat(60));
      
      // Invalidate query cache to trigger immediate UI update
      console.log(`   🔄 Calling queryClient.invalidateQueries()...`);
      await queryClient.invalidateQueries({ queryKey: ["league-standings"] });
      console.log(`   ✅ queryClient.invalidateQueries() completed - UI should now refresh`);
      
      // Verify total teams in database
      console.log("\n🔍 [useHook] Verifying teams in database...");
      const { count, error: countError } = await supabase
        .from("league_standings")
        .select("*", { count: "exact", head: true });
      
      if (countError) {
        console.warn(`   ⚠️  Could not verify count: ${countError.message}`);
      } else {
        console.log(`   ✅ Total teams in database: ${count}`);
      }
      
      console.log("\n📋 DB Update Result: SUCCESS");
      console.log(`   Teams saved: ${savedCount}`);
      console.log(`   Total in DB: ${count || 'unknown'}`);
      console.log(`   UI refreshed via React Query invalidation ✓`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
      
      return {
        success: true,
        teams_saved: savedCount,
        teams_in_db: count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("\n" + "═".repeat(60));
      console.error("❌ DB Update Failed!");
      console.error(`   Error: ${errorMessage}`);
      console.error("═".repeat(60));
      throw error;
    }
  };
}
