import { Crown, Star, Medal } from "lucide-react";
import leagueData from "../data/leagueData.json";

const { players, seasonStats } = leagueData;

export function StatsTab() {
  return (
    <div className="px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl orange-gradient-bg flex items-center justify-center shadow-glow">
          <Crown className="text-primary-foreground" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-display uppercase text-foreground">טבלת מובילים</h1>
          <p className="text-sm text-muted-foreground">League Leaderboard</p>
        </div>
      </div>

      {/* Stats Legend */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">PPG = נקודות למשחק</span>
        </div>
        <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">3PM = שלשות</span>
        </div>
      </div>

      {/* Player Cards */}
      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.rank}
            className={`stat-card rounded-2xl p-4 transition-all hover:scale-[1.02] ${player.isUs ? "glow-border border-primary/50" : ""
              }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              {/* Rank & Avatar */}
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${player.rank === 1
                    ? "orange-gradient-bg shadow-glow"
                    : player.isUs
                      ? "bg-blue-500/30 border-2 border-blue-400"
                      : "bg-surface-elevated"
                  }`}>
                  {player.avatar}
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${player.rank === 1
                    ? "bg-primary text-primary-foreground"
                    : player.rank === 2
                      ? "bg-gray-400 text-gray-900"
                      : player.rank === 3
                        ? "bg-amber-700 text-amber-100"
                        : "bg-surface-elevated text-muted-foreground"
                  }`}>
                  {player.rank}
                </div>
                {player.rank === 1 && (
                  <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-400 fill-yellow-400" size={16} />
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-display truncate ${player.isUs ? "text-primary" : "text-foreground"}`}>
                    {player.name}
                  </h3>
                  {player.isUs && <Star className="text-primary flex-shrink-0" size={14} />}
                </div>
                <p className="text-xs text-muted-foreground">{player.nameEn}</p>
                <p className={`text-xs mt-0.5 ${player.isUs ? "text-blue-400" : "text-primary/70"}`}>{player.team}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-3 flex-shrink-0">
                <div className="text-center">
                  <p className={`text-xl font-display ${player.isUs ? "text-primary glow-text" : "text-primary"}`}>
                    {player.ppg}
                  </p>
                  <p className="text-xs text-muted-foreground">PPG</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <p className="text-xl font-display text-green-500">{player.threepm}</p>
                  <p className="text-xs text-muted-foreground">3PM</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Season Stats Summary */}
      <div className="mt-8">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <Medal className="text-primary" size={20} />
          סטטיסטיקות ליגה
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {seasonStats.map((stat, index) => (
            <div key={index} className="stat-card rounded-xl p-4 text-center">
              <p className={`text-2xl font-display ${stat.color} glow-text`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground/70">{stat.labelEn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-8" />
    </div>
  );
}
