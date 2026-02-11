import { Calendar, Clock, Play, AlertTriangle, Trophy, Target } from "lucide-react";
import { useMemo } from "react";

// Schedule of upcoming games - add more as needed
const gameSchedule = [
  {
    opponent: "מכבי רמת גן אמיר",
    opponentEn: "Maccabi Ramat Gan Amir",
    date: new Date("2026-02-05T19:00:00"),
    dateHe: "5 בפברואר",
    dateEn: "Feb 5",
    time: "19:00",
    venue: "רמת גן",
    isHome: false,
    opponentColor: "#4CAF50",
    opponentEmoji: "🏀",
    lastMeeting: {
      result: "טרם נערך",
      winner: "-",
      winnerEn: "-",
      summary: "משחק ראשון העונה מול הקבוצה המובילה בליגה.",
      summaryEn: "First game this season vs league leaders.",
      keyStats: [
        { label: "מיקום שלהם", value: "1" },
        { label: "ניצחונות", value: "7/7" },
        { label: "המיקום שלנו", value: "5" },
      ],
    },
    scoutingNotes: [
      { icon: AlertTriangle, note: "הקבוצה המובילה בליגה - 7 ניצחונות ב-7 משחקים!" },
      { icon: Target, note: "הפרש נקודות +173 - התקפה חזקה מאוד" },
      { icon: Trophy, note: "משחק חוץ - צריך להתחיל חזק ולא להיבהל" },
    ],
  },
  {
    opponent: "מכבי ת״א צפון",
    opponentEn: "Maccabi Tel Aviv North",
    date: new Date("2026-02-26T18:00:00"),
    dateHe: "26 בפברואר",
    dateEn: "Feb 26",
    time: "18:00",
    venue: "בית",
    isHome: true,
    opponentColor: "#FFC107",
    opponentEmoji: "⭐",
    lastMeeting: {
      result: "טרם נערך",
      winner: "-",
      winnerEn: "-",
      summary: "קבוצה חזקה במקום השני בליגה.",
      summaryEn: "Strong team in 2nd place.",
      keyStats: [
        { label: "מיקום שלהם", value: "2" },
        { label: "ניצחונות", value: "6/8" },
        { label: "קלעו", value: "551" },
      ],
    },
    scoutingNotes: [
      { icon: AlertTriangle, note: "מקום שני בליגה - 6 ניצחונות מ-8 משחקים" },
      { icon: Target, note: "הפרש נקודות +164 - התקפה יעילה" },
      { icon: Trophy, note: "משחק בית - היתרון שלנו!" },
    ],
  },
  {
    opponent: "מכבי תל אביב מערב",
    opponentEn: "Maccabi Tel Aviv West",
    date: new Date("2026-03-05T19:00:00"),
    dateHe: "5 במרץ",
    dateEn: "Mar 5",
    time: "19:00",
    venue: "TBD",
    isHome: false,
    opponentColor: "#FFEB3B",
    opponentEmoji: "🌟",
    lastMeeting: {
      result: "טרם נערך",
      winner: "-",
      winnerEn: "-",
      summary: "מקום שלישי בליגה - קבוצה מאוזנת.",
      summaryEn: "3rd place - balanced team.",
      keyStats: [
        { label: "מיקום שלהם", value: "3" },
        { label: "ניצחונות", value: "6/8" },
        { label: "קלעו", value: "466" },
      ],
    },
    scoutingNotes: [
      { icon: AlertTriangle, note: "מקום שלישי - 6 ניצחונות מ-8" },
      { icon: Target, note: "הפרש נקודות +31 - משחקים צמודים" },
      { icon: Trophy, note: "קבוצה מאוזנת - צריך להיות מוכנים" },
    ],
  },
];

// Hook to get the next upcoming game
function useNextGame() {
  return useMemo(() => {
    const now = new Date();
    const upcomingGame = gameSchedule.find(game => game.date > now);
    return upcomingGame || gameSchedule[gameSchedule.length - 1]; // Fallback to last game if all passed
  }, []);
}

export function GamePrep() {
  const nextGame = useNextGame();
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl orange-gradient-bg flex items-center justify-center shadow-glow">
          <Calendar className="text-primary-foreground" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-display uppercase text-foreground">הכנה למשחק</h2>
          <p className="text-sm text-muted-foreground">Game Preparation</p>
        </div>
      </div>

      {/* Next Game Card */}
      <div className="stat-card rounded-2xl p-5 glow-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-primary uppercase font-bold tracking-wider">המשחק הבא</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>{nextGame.dateHe}</span>
          </div>
        </div>

        {/* Teams vs */}
        <div className="flex items-center justify-between mb-6">
          {/* Home Team (Bnei Yehuda or Opponent) */}
          <div className="flex-1 text-center">
            <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl border-2 shadow-lg ${
              nextGame.isHome 
                ? "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400" 
                : `bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-400`
            }`}>
              {nextGame.isHome ? "🏀" : nextGame.opponentEmoji}
            </div>
            <p className="font-display text-foreground text-sm">
              {nextGame.isHome ? "בני יהודה תל אביב" : nextGame.opponent}
            </p>
            <p className="text-xs text-muted-foreground">
              {nextGame.isHome ? "Bnei Yehuda" : nextGame.opponentEn}
            </p>
          </div>

          {/* VS */}
          <div className="px-4">
            <div className="w-12 h-12 rounded-full orange-gradient-bg flex items-center justify-center shadow-glow animate-pulse-glow">
              <span className="font-display text-primary-foreground text-lg">VS</span>
            </div>
          </div>

          {/* Away Team (Opponent or Bnei Yehuda) */}
          <div className="flex-1 text-center">
            <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl border-2 shadow-lg ${
              !nextGame.isHome 
                ? "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400" 
                : `bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-400`
            }`}>
              {!nextGame.isHome ? "🏀" : nextGame.opponentEmoji}
            </div>
            <p className="font-display text-foreground text-sm">
              {!nextGame.isHome ? "בני יהודה תל אביב" : nextGame.opponent}
            </p>
            <p className="text-xs text-muted-foreground">
              {!nextGame.isHome ? "Bnei Yehuda" : nextGame.opponentEn}
            </p>
          </div>
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <Clock className="text-primary mx-auto mb-1" size={18} />
            <p className="font-display text-foreground">{nextGame.time}</p>
            <p className="text-xs text-muted-foreground">שעת התחלה</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <Trophy className="text-primary mx-auto mb-1" size={18} />
            <p className="font-display text-foreground">{nextGame.isHome ? "בית" : "חוץ"}</p>
            <p className="text-xs text-muted-foreground">{nextGame.isHome ? "Home Game" : "Away Game"}</p>
          </div>
        </div>
      </div>

      {/* Last Meeting */}
      <div className="stat-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-foreground">המפגש האחרון מול {nextGame.opponent}</span>
          <span className="text-xs text-muted-foreground">Last Meeting</span>
        </div>

        {/* Result */}
        <div className="glass-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-2xl font-display ${nextGame.lastMeeting.winner === "בני יהודה" ? "text-green-400" : "text-red-400"}`}>
                {nextGame.lastMeeting.result}
              </p>
              <p className="text-xs text-muted-foreground">לטובת {nextGame.lastMeeting.winner}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              nextGame.lastMeeting.winner === "בני יהודה" 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            }`}>
              {nextGame.lastMeeting.winner === "בני יהודה" ? "ניצחון" : "הפסד"}
            </div>
          </div>
          
          <p className="text-sm text-foreground">{nextGame.lastMeeting.summary}</p>
          <p className="text-xs text-primary mt-1">{nextGame.lastMeeting.summaryEn}</p>
        </div>

        {/* Key Stats from Last Game */}
        <div className="grid grid-cols-3 gap-2">
          {nextGame.lastMeeting.keyStats.map((stat, index) => (
            <div key={index} className="bg-surface-elevated/50 rounded-lg p-2 text-center">
              <p className="text-lg font-display text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scouting Notes */}
      <div className="stat-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-foreground">הערות סקאוטינג</span>
          <span className="text-xs text-muted-foreground">Scouting Notes</span>
        </div>

        <div className="space-y-3">
          {nextGame.scoutingNotes.map((note, index) => {
            const IconComponent = note.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-surface-elevated/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="text-primary" size={16} />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{note.note}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlight Video Placeholder */}
      <div className="stat-card rounded-2xl overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-surface-elevated to-background flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="text-center z-10">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full orange-gradient-bg flex items-center justify-center shadow-glow cursor-pointer hover:scale-110 transition-transform">
              <Play className="text-primary-foreground ml-1" size={28} fill="currentColor" />
            </div>
            <p className="text-foreground font-display">היילייטים מהמשחק האחרון</p>
            <p className="text-xs text-muted-foreground">Watch Last Game Highlights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
