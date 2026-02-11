import { useState } from "react";
import { Trophy, Target, Video, Clock, Flame, CheckCircle2, Play, Zap, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

const weeklyChallenges = [
  {
    id: 1,
    title: "אתגר 20 שלשות באימון",
    titleEn: "20 Threes in Practice",
    description: "קלע 20 שלשות מוצלחות במהלך האימון הבא",
    progress: 12,
    total: 20,
    daysLeft: 5,
    reward: "50 XP",
  },
  {
    id: 2,
    title: "10 דקות תרגול כדרור",
    titleEn: "10 Min Dribbling Practice",
    description: "תרגל כדרור במשך 10 דקות רצופות",
    progress: 6,
    total: 10,
    daysLeft: 5,
    reward: "30 XP",
  },
];

const completedChallenges = [
  { title: "15 קליעות חופשיות", completed: true, date: "28 בינואר" },
  { title: "5 דקות יורו-סטאפ", completed: true, date: "25 בינואר" },
  { title: "10 אסיסטים באימון", completed: true, date: "20 בינואר" },
];

const skillDrills = [
  { 
    id: 1, 
    title: "יורו-סטאפ בקלי קלות", 
    titleEn: "Easy Euro Step", 
    description: "סרטון קצר הממוקד בטכניקה הפשוטה לביצוע המהלך.",
    youtubeId: "Fowg-gNQ92Q",
    difficulty: "intermediate",
    icon: "⚡",
  },
  { 
    id: 2, 
    title: "קרוסאובר אפקטיבי", 
    titleEn: "Effective Crossover", 
    description: "דגשים חשובים לביצוע קרוסאובר יעיל ומהיר.",
    youtubeId: "e4XvisoxHo0",
    difficulty: "beginner",
    icon: "🏀",
  },
];

const difficultyColors = {
  beginner: { bg: "bg-green-500/20", text: "text-green-500", label: "מתחיל" },
  intermediate: { bg: "bg-yellow-500/20", text: "text-yellow-500", label: "בינוני" },
  advanced: { bg: "bg-red-500/20", text: "text-red-500", label: "מתקדם" },
};

interface SkillDrill {
  id: number;
  title: string;
  titleEn: string;
  description: string;
  youtubeId: string;
  difficulty: string;
  icon: string;
}

interface DifficultyStyle {
  bg: string;
  text: string;
  label: string;
}

function SkillVideoCard({ drill, difficulty }: { drill: SkillDrill; difficulty: DifficultyStyle }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="stat-card rounded-2xl overflow-hidden glow-border">
      {/* Video Thumbnail / Embed */}
      <div className="relative aspect-video bg-surface-elevated">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${drill.youtubeId}?autoplay=1&rel=0`}
            title={drill.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            {/* YouTube Thumbnail */}
            <img 
              src={`https://img.youtube.com/vi/${drill.youtubeId}/maxresdefault.jpg`}
              alt={drill.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${drill.youtubeId}/hqdefault.jpg`;
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full orange-gradient-bg shadow-glow flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="text-primary-foreground ml-1" size={28} />
              </div>
            </div>
            {/* Skill Icon Badge */}
            <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-surface-dark/80 backdrop-blur-sm flex items-center justify-center text-xl">
              {drill.icon}
            </div>
            {/* Difficulty Badge */}
            <div className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full ${difficulty.bg} ${difficulty.text} backdrop-blur-sm`}>
              {difficulty.label}
            </div>
          </div>
        )}
      </div>
      
      {/* Info Section */}
      <div className="p-4">
        <h4 className="font-display text-lg text-foreground mb-1">{drill.title}</h4>
        <p className="text-xs text-muted-foreground mb-2">{drill.titleEn}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{drill.description}</p>
      </div>
    </div>
  );
}

interface WeeklyChallengeCardProps {
  challenge: {
    id: number;
    title: string;
    titleEn: string;
    description: string;
    progress: number;
    total: number;
    daysLeft: number;
    reward: string;
  };
  onComplete: () => void;
}

function WeeklyChallengeCard({ challenge, onComplete }: WeeklyChallengeCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleComplete = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b00', '#ffa500', '#ffd700', '#ffffff'],
    });
    
    setShowSuccess(true);
    setIsCompleted(true);
    onComplete();
    
    // Hide success animation after 2 seconds
    setTimeout(() => setShowSuccess(false), 2000);
  };

  if (isCompleted && !showSuccess) {
    return null;
  }

  return (
    <div className={`stat-card rounded-2xl p-4 transition-all ${showSuccess ? 'border-2 border-green-500 glow-border' : ''}`}>
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3 animate-float">
            <PartyPopper className="text-green-500" size={32} />
          </div>
          <h3 className="font-display text-xl text-green-500 mb-1">כל הכבוד! 🎉</h3>
          <p className="text-sm text-muted-foreground">השלמת את האתגר!</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="text-primary" size={18} />
              <span className="text-sm font-bold text-foreground">{challenge.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">{challenge.daysLeft} ימים</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
          
          <div className="flex items-center gap-3 mb-4">
            <Progress value={(challenge.progress / challenge.total) * 100} className="h-2 flex-1" />
            <span className="text-sm font-display text-primary">{challenge.progress}/{challenge.total}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={14} />
              <span className="text-xs text-muted-foreground">{challenge.reward}</span>
            </div>
            <button 
              onClick={handleComplete}
              className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold flex items-center gap-2 hover:bg-green-600 transition-colors hover:scale-105 active:scale-95"
            >
              <CheckCircle2 size={16} />
              השלמתי!
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ChallengesTab() {
  const [completedCount, setCompletedCount] = useState(completedChallenges.length);

  const handleChallengeComplete = () => {
    setCompletedCount(prev => prev + 1);
  };

  return (
    <div className="px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl orange-gradient-bg flex items-center justify-center shadow-glow">
          <Target className="text-primary-foreground" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-display uppercase text-foreground">אתגרים שבועיים</h1>
          <p className="text-sm text-muted-foreground">Weekly Challenges</p>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="stat-card rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Flame className="text-primary" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">אתגרים שהושלמו</p>
            <p className="text-2xl font-display text-primary glow-text">{completedCount}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">הישג הבא</p>
          <p className="text-sm text-foreground">MVP זהב</p>
          <p className="text-xs text-primary">עוד {Math.max(0, 3 - completedCount)} אתגרים</p>
        </div>
      </div>

      {/* Weekly Challenges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-foreground flex items-center gap-2">
            <Clock className="text-primary" size={18} />
            אתגרים פעילים
          </h3>
          <span className="text-xs text-muted-foreground">Active Challenges</span>
        </div>

        <div className="space-y-3">
          {weeklyChallenges.map((challenge) => (
            <WeeklyChallengeCard 
              key={challenge.id} 
              challenge={challenge} 
              onComplete={handleChallengeComplete}
            />
          ))}
        </div>
      </div>

      {/* Skills Lab Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-foreground flex items-center gap-2">
            <Play className="text-primary" size={20} />
            מעבדת כישורים
          </h3>
          <span className="text-xs text-muted-foreground">Skills Lab</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {skillDrills.map((drill) => {
            const difficulty = difficultyColors[drill.difficulty as keyof typeof difficultyColors];
            
            return (
              <SkillVideoCard key={drill.id} drill={drill} difficulty={difficulty} />
            );
          })}
        </div>
      </div>

      {/* Completed Challenges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-foreground flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={20} />
            אתגרים שהושלמו
          </h3>
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>

        <div className="space-y-2">
          {completedChallenges.map((challenge, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50 border border-green-500/20"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" size={18} />
                <span className="text-sm text-foreground">{challenge.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{challenge.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-8" />
    </div>
  );
}
