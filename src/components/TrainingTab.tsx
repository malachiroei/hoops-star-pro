import React, { useState } from "react";
import {
  Activity, Dumbbell, Utensils, Dribbble, Star,
  Trophy, BarChart3, Target, Zap, Shield,
  ChevronRight, Sunrise, Sun, Cookie, Flame, Clock,
  Check, Camera, MessageSquare, Play, X, Loader2, Lightbulb, Apple, Wheat, Drumstick
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
const leaguePlayers = [
  { id: "1", name: "רביד מלאכי", ppg: 18.5, rpg: 4.2, apg: 3.1, fg: "52%", team: "מכבי רמת גן" },
  { id: "2", name: "דוד מזרחי", ppg: 16.2, rpg: 5.8, apg: 2.4, fg: "48%", team: "הפועל ת\"א" },
];

// Meal images
import mealBreakfast from "@/assets/meal-breakfast.jpg";
import mealLunch from "@/assets/meal-lunch.jpg";
import mealDinner from "@/assets/meal-dinner.jpg";
import mealSnacks from "@/assets/meal-snacks.jpg";

interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  sets: string;
  icon: string;
  category: "strength" | "agility";
  youtubeId?: string;
}

const exercises: Exercise[] = [
  { id: "pushups", name: "שכיבות סמיכה", nameEn: "Push-ups", sets: "3 × 15", icon: "💪", category: "strength", youtubeId: "IODxDxX7oi4" },
  { id: "squats", name: "סקוואטים", nameEn: "Squats", sets: "3 × 20", icon: "🦵", category: "strength", youtubeId: "YaXPRqUwItQ" },
  { id: "planks", name: "פלאנק", nameEn: "Planks", sets: "3 × 45 שניות", icon: "🧘", category: "strength", youtubeId: "ASdvN_XEl_c" },
  { id: "jumpingjacks", name: "קפיצות פיסוק", nameEn: "Jumping Jacks", sets: "3 × 30", icon: "⭐", category: "agility" },
  { id: "highknees", name: "ברכיים לחזה", nameEn: "High Knees", sets: "3 × 20", icon: "🏃", category: "agility" },
];

const TrainingTab = () => {
  return (
    <div className="p-4 space-y-6 pb-28 text-right bg-[#020617]" dir="rtl">
      {/* Header Elite */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 border border-purple-500/30 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-purple-500/50 shadow-inner">
            <Activity className="text-purple-400" size={38} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            ELITE <span className="text-purple-500">PERFORMANCE</span>
          </h1>
          <div className="flex gap-3">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">V3.0</Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-bold">SCOUTING ACTIVE</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-slate-900/90 backdrop-blur-xl h-16 border border-white/10 p-1.5 rounded-2xl sticky top-4 z-50 shadow-2xl">
          <TabsTrigger value="workout" className="data-[state=active]:bg-purple-600 rounded-xl transition-all text-xs">כושר</TabsTrigger>
          <TabsTrigger value="nutrition" className="data-[state=active]:bg-purple-600 rounded-xl transition-all text-xs">תזונה</TabsTrigger>
          <TabsTrigger value="moves" className="data-[state=active]:bg-purple-600 rounded-xl transition-all text-xs">מהלכים</TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-orange-600 rounded-xl font-bold text-orange-400 data-[state=active]:text-white text-xs">סקאוטינג 🌟</TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="mt-8 space-y-6">
          <Card className="glass-card border-white/10 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5"><CardTitle className="text-lg flex items-center justify-end gap-2 italic">אימון כוח ופיצוץ <Trophy className="text-yellow-500" size={20}/></CardTitle></CardHeader>
            <CardContent className="p-0">
              {[
                { name: "Trap Bar Deadlift", sets: "4x6", load: "85% RM" },
                { name: "Box Jumps", sets: "3x8", load: "60cm" },
                { name: "MedBall Slams", sets: "4x12", load: "8kg" }
              ].map((ex, i) => (
                <div key={i} className="flex justify-between items-center p-4 border-b border-white/5 last:border-0 hover:bg-white/5">
                  <ChevronRight size={16} className="text-slate-600" />
                  <div className="text-right">
                    <span className="font-bold text-sm text-white block">{ex.name}</span>
                    <span className="text-[10px] text-slate-500">{ex.sets} • {ex.load} • 90s מנוחה</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          {/* אימון אישי */}
          <div className="space-y-4 mt-8">
            {exercises.map((exercise, idx) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isCompleted={false}
                onToggle={() => {}}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-8 space-y-6">
          <Card className="glass-card border-purple-500/20 p-6">
            <div className="space-y-6">
              <div className="flex gap-4 items-start border-r-2 border-purple-500/20 pr-4">
                <Sunrise className="text-yellow-500" size={24} />
                <div className="text-right">
                  <h4 className="font-bold text-white text-sm">ארוחת בוקר (07:30)</h4>
                  <p className="text-xs text-slate-400">שיבולת שועל עם חלבון, פירות יער וחמאת בוטנים.</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30">
                <Badge className="mb-2 bg-orange-500 text-black font-bold text-[8px]">ניסוי 🧪</Badge>
                <h4 className="font-bold text-orange-400 flex items-center gap-2 mb-1">נשנוש קדם-אימון</h4>
                <p className="text-sm text-slate-300 italic">2 תמרים + חופן אגוזי מלך לאנרגיה מתפרצת.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-8 space-y-6">
          <Card className="glass-card border-orange-500/40 bg-slate-950 overflow-hidden shadow-2xl p-8">
            <div className="bg-orange-500 text-black text-center text-[10px] font-black py-1 uppercase tracking-widest mb-6">Live Scouting Report</div>
            <div className="flex justify-between items-center mb-12 relative">
              <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center border-4 border-slate-950 z-20 font-black italic text-black">VS</div>
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-4xl shadow-xl">👤</div>
                <h3 className="font-black text-orange-500 text-sm uppercase">{leaguePlayers[0].name}</h3>
              </div>
              <div className="flex-1 flex flex-col items-center gap-3 opacity-70">
                <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-4xl">👤</div>
                <h3 className="font-black text-white text-sm uppercase">{leaguePlayers[1].name}</h3>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { label: "Points Per Game", p1: 18.5, p2: 16.2, max: 25, color: "bg-orange-500" },
                { label: "Field Goal %", p1: 52, p2: 48, max: 70, color: "bg-emerald-500" }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 px-1">
                    <span>{stat.p2}</span><span className="text-white italic">{stat.label}</span><span>{stat.p1}</span>
                  </div>
                  <div className="flex h-2 gap-1.5 items-center">
                    <div className="flex-1 flex justify-end">
                      <div className={`${stat.color} h-full rounded-l-full`} style={{ width: `${(stat.p1/stat.max)*100}%` }}></div>
                    </div>
                    <div className="flex-1 bg-white/5 h-full rounded-r-full overflow-hidden">
                      <div className="bg-slate-600 h-full" style={{ width: `${(stat.p2/stat.max)*100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-right">
               <h4 className="text-xs font-bold text-orange-500 mb-1 flex items-center justify-end gap-1"><BarChart3 size={14}/> סיכום סקאוט</h4>
               <p className="text-[11px] text-slate-400 leading-relaxed italic">רביד מוביל ביעילות התקפית. מומלץ לחץ על הכדור בפרימטר לצמצום אחוזי הקליעה.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function ExerciseCard({ exercise, isCompleted, onToggle }) {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <>
      <Card className={`glass-card overflow-hidden transition-all duration-300 ${isCompleted ? 'border-primary/50 bg-primary/10' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 cursor-pointer" onClick={onToggle}>
              <Checkbox checked={isCompleted} className="h-6 w-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl cursor-pointer ${isCompleted ? 'bg-primary/20' : 'bg-surface-dark'}`} onClick={onToggle}>
              {exercise.icon}
            </div>
            <div className="flex-grow" onClick={onToggle} style={{cursor: 'pointer'}}>
              <h3 className={`font-semibold ${isCompleted ? 'text-primary' : ''}`}>{exercise.name}</h3>
              <p className="text-muted-foreground text-xs">{exercise.nameEn}</p>
            </div>
            <Badge variant="outline" className={`${isCompleted ? 'border-primary text-primary bg-primary/10' : 'border-border'}`}>{exercise.sets}</Badge>
            {exercise.youtubeId && (
              <Button size="sm" variant="ghost" className="hover:bg-primary/20 text-primary" onClick={() => setShowVideo(true)}>
                <Play size={16} />
              </Button>
            )}
            {isCompleted && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check size={14} className="text-primary-foreground" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {showVideo && exercise.youtubeId && (
        <VideoModal youtubeId={exercise.youtubeId} title={exercise.name} onClose={() => setShowVideo(false)} />
      )}
    </>
  );
}

function VideoModal({ youtubeId, title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-dark rounded-2xl border border-border shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-b-2xl"
          />
        </div>
      </div>
    </div>
  );
}

export default TrainingTab;
