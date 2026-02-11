import { Star, Hash } from "lucide-react";
import { GamePrep } from "./GamePrep";
import leagueData from "../data/leagueData.json";

const { standings, players: allPlayers } = leagueData;
const topScorers = allPlayers.slice(0, 3);

export function HomeTab() {
  return (
    <div className="px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display uppercase text-foreground glow-text tracking-wider flex items-center gap-2">
          HoopsPro
          <img src="/basketball.svg" alt="Basketball" className="w-8 h-8 inline-block -mt-1" />
        </h1>
        <p className="text-muted-foreground mt-1">ליגת כדורסל נוער • Youth Basketball</p>
      </div>

      {/* League Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl orange-gradient-bg flex items-center justify-center shadow-glow">
          <img src="/basketball.svg" alt="Basketball" className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-display uppercase text-foreground">טבלת ליגה</h2>
          <p className="text-sm text-muted-foreground">League Standings</p>
        </div>
      </div>

      {/* Standings Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 mb-2">
        <div className="col-span-1 flex items-center justify-center">
          <Hash className="text-muted-foreground" size={14} />
        </div>
        <div className="col-span-5 text-xs text-muted-foreground font-medium">קבוצה</div>
        <div className="col-span-2 text-xs text-muted-foreground font-medium text-center">W</div>
        <div className="col-span-2 text-xs text-muted-foreground font-medium text-center">L</div>
        <div className="col-span-2 text-xs text-muted-foreground font-medium text-center">PTS</div>
      </div>

      {/* Standings Cards */}
      <div className="space-y-2 mb-6">
        {standings.map((team) => (
          <div
            key={team.rank}
            className={`glass-card rounded-xl p-3 transition-all duration-300 ${team.isUs
              ? "border-2 border-primary glow-border animate-pulse-glow"
              : "border border-border/30 hover:border-border/60"
              }`}
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Rank */}
              <div className="col-span-1 flex items-center justify-center">
                <span className={`text-lg font-display font-black ${team.rank === 1 ? "text-primary glow-text" : team.isUs ? "text-primary" : "text-foreground"
                  }`}>
                  {team.rank}
                </span>
              </div>

              {/* Team with Logo */}
              <div className="col-span-5 flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${team.color}, ${team.color}88)`,
                    boxShadow: `0 0 12px ${team.color}40`
                  }}
                >
                  <span className="text-white font-display drop-shadow-md">
                    {team.team.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium text-xs leading-tight ${team.isUs ? "text-primary" : "text-foreground"}`}>
                    {team.team}
                  </p>
                  {team.isUs && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="text-primary fill-primary" size={10} />
                      <span className="text-[10px] text-primary">הקבוצה שלנו</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Wins - Highlighted */}
              <div className="col-span-2 text-center">
                <span className="text-lg font-display font-black text-primary">
                  {team.wins}
                </span>
              </div>

              {/* Losses */}
              <div className="col-span-2 text-center">
                <span className="text-lg font-display font-black text-destructive">
                  {team.losses}
                </span>
              </div>

              {/* Points */}
              <div className="col-span-2 text-center">
                <span className={`text-lg font-display font-black ${team.isUs ? "text-primary glow-text" : "text-foreground"
                  }`}>
                  {team.points}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Scorers Mini Leaderboard */}
      <div className="stat-card rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-foreground flex items-center gap-2">
            <Star className="text-primary" size={18} />
            מובילי הליגה בנקודות
          </h3>
          <span className="text-xs text-muted-foreground">Top Scorers</span>
        </div>
        <div className="space-y-2">
          {topScorers.map((player) => (
            <div key={player.rank} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-elevated/30">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-display ${player.rank === 1 ? "text-primary" : "text-muted-foreground"}`}>
                  {player.rank}
                </span>
                <div>
                  <p className={`text-sm font-medium ${player.name === "רביד מלאכי" ? "text-primary" : "text-foreground"}`}>
                    {player.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{player.team}</p>
                </div>
              </div>
              <div className="text-left">
                <p className={`font-display ${player.name === "רביד מלאכי" ? "text-primary glow-text" : "text-foreground"}`}>
                  {player.ppg}
                </p>
                <p className="text-xs text-muted-foreground">PPG</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Prep Section */}
      <GamePrep />

      {/* Bottom Spacing */}
      <div className="h-8" />
    </div>
  );
}

