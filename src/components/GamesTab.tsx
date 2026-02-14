import { useState, useEffect } from "react";
import { Calendar, MapPin, Trophy, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function GamesTab() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase
          .from('games') // נצטרך לוודא שזה שם הטבלה ב-Supabase
          .select('*')
          .order('game_date', { ascending: true });

        if (error) throw error;
        setGames(data || []);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const now = new Date();
  const upcomingGames = games.filter(g => new Date(g.game_date) >= now);
  const pastGames = games.filter(g => new Date(g.game_date) < now).reverse();

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="px-4 py-6 space-y-8 animate-fade-in">
      {/* משחקים קרובים */}
      <section>
        <h2 className="text-xl font-display uppercase text-primary mb-4 flex items-center gap-2">
          <Clock size={20} /> משחקים קרובים
        </h2>
        <div className="space-y-4">
          {upcomingGames.map(game => (
            <GameCard key={game.id} game={game} isUpcoming={true} />
          ))}
        </div>
      </section>

      {/* משחקי עבר */}
      <section>
        <h2 className="text-xl font-display uppercase text-muted-foreground mb-4 flex items-center gap-2">
          <Trophy size={20} /> תוצאות אחרונות
        </h2>
        <div className="space-y-4">
          {pastGames.map(game => (
            <GameCard key={game.id} game={game} isUpcoming={false} />
          ))}
        </div>
      </section>
    </div>
  );
}

function GameCard({ game, isUpcoming }: { game: any, isUpcoming: boolean }) {
  return (
    <div className={`glass-card rounded-2xl p-4 border ${isUpcoming ? 'border-primary/30' : 'border-border/20 opacity-80'}`}>
      <div className="flex justify-between items-center mb-3 text-[10px] text-muted-foreground uppercase tracking-widest">
        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(game.game_date).toLocaleDateString('he-IL')}</span>
        <span className="flex items-center gap-1"><MapPin size={12} /> {game.location || 'אולם ביתי'}</span>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center font-bold text-sm">{game.home_team}</div>
        <div className="flex flex-col items-center gap-1">
          {isUpcoming ? (
             <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black">VS</div>
          ) : (
             <div className="text-xl font-black">{game.home_score} - {game.away_score}</div>
          )}
          <span className="text-[10px] text-muted-foreground">{new Date(game.game_date).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div className="flex-1 text-center font-bold text-sm">{game.away_team}</div>
      </div>
    </div>
  );
}