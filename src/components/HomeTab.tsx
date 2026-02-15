import { useState, useEffect } from "react";
import { Star, Hash, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GamePrep } from "./GamePrep";
import { supabase } from "@/integrations/supabase/client";

export function HomeTab() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      try {
        console.log("Attempting to fetch standings...");
        const { data, error } = await supabase
          .from('league_standings')
          .select('*')
          .order('points', { ascending: false });

        if (error) throw error;
        console.log("Data fetched successfully:", data);
        setStandings(data || []);
      } catch (error) {
        console.error("Error fetching standings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStandings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-display uppercase text-foreground glow-text tracking-wider flex items-center gap-2">
            HoopsPro
            <img src="/basketball.svg" alt="Basketball" className="w-8 h-8 inline-block -mt-1" />
          </h1>
          <Badge className="bg-red-100 text-red-700 border border-red-300 text-xs font-semibold">
            גרסת בדיקות
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">ליגת כדורסל נוער • Youth Basketball</p>
      </div>

      {/* League Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl orange-gradient-bg flex items-center justify-center shadow-glow">
          <img src="/basketball.svg" alt="Basketball" className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-display uppercase text-foreground">טבלת ליגה ילדים א תל אביב 2026</h2>
          <p className="text-sm text-muted-foreground">League Standings (Live)</p>
        </div>
      </div>

      {/* Standings Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 mb-2">
        <div className="col-span-1 flex items-center justify-center">
          <Hash className="text-muted-foreground" size={14} />
        </div>
        <div className="col-span-5 text-xs text-muted-foreground font-medium">קבוצה</div>
        <div className="col-span-2 text-xs text-muted-foreground font-medium text-center">מש׳</div>
        <div className="col-span-1 text-xs text-muted-foreground font-medium text-center">W</div>
        <div className="col-span-1 text-xs text-muted-foreground font-medium text-center">L</div>
        <div className="col-span-2 text-xs text-muted-foreground font-medium text-center">PTS</div>
      </div>

      {/* Standings Cards */}
      <div className="space-y-2 mb-6">
        {standings.length === 0 ? (
          <div className="text-center py-10 glass-card rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">לא נמצאו נתונים בטבלה</p>
          </div>
        ) : (
          standings.map((team, index) => {
            const isOurTeam = team.name?.includes("בני יהודה") || team.name?.includes("רביד");
            
            // חישוב מספר המשחקים
            const calculatedGP = (Number(team.wins) || 0) + (Number(team.losses) || 0);

            return (
              <div
                key={team.id}
                className={`glass-card rounded-xl p-3 transition-all duration-300 ${isOurTeam
                  ? "border-2 border-primary glow-border animate-pulse-glow"
                  : "border border-border/30 hover:border-border/60"
                  }`}
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`text-lg font-display font-black ${index === 0 ? "text-primary glow-text" : isOurTeam ? "text-primary" : "text-foreground"}`}>
                      {index + 1}
                    </span>
                  </div>

                  <div className="col-span-5 flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, #ff6b00, #ff9e00)`,
                        boxShadow: `0 0 12px rgba(255, 107, 0, 0.2)`
                      }}
                    >
                      <span className="text-white font-display drop-shadow-md">
                        {(team.name || "").charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium text-[10px] sm:text-xs leading-tight ${isOurTeam ? "text-primary" : "text-foreground"}`}>
                        {team.name}
                      </p>
                      {isOurTeam && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="text-primary fill-primary" size={10} />
                          <span className="text-[10px] text-primary font-bold">הקבוצה שלנו</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* עמודת משחקים (GP) */}
                  <div className="col-span-2 text-center text-base font-display font-black text-blue-400">
                    {calculatedGP}
                  </div>
                  
                  <div className="col-span-1 text-center text-base font-display font-black text-primary">
                    {team.wins}
                  </div>
                  <div className="col-span-1 text-center text-base font-display font-black text-destructive">
                    {team.losses}
                  </div>
                  <div className="col-span-2 text-center text-lg font-display font-black text-foreground">
                    {team.points}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <GamePrep />
      <div className="h-8" />
    </div>
  );
}