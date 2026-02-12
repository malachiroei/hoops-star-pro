import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export async function triggerLeagueUpdate() {
  try {
    const { data, error } = await supabase.functions.invoke(
      "fetch-league-standings",
      {
        method: "POST",
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Failed to trigger league update:", error);
    throw error;
  }
}
