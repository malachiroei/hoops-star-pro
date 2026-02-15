import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, Dumbbell, Utensils, Dribbble, Star, 
  Trophy, BarChart3, Target, Zap, Shield, 
  ChevronRight, Sunrise, Sun, Cookie, Flame, Clock
} from "lucide-react";

// מאגר נתונים מלא של הליגה - לסקאוטינג מקצועי
const leaguePlayers = [
  { id: "1", name: "רביד מלאכי", ppg: 18.5, rpg: 4.2, apg: 3.1, spg: 1.5, fg: "52%", team: "מכבי רמת גן", rank: 1 },
  { id: "2", name: "דוד מזרחי", ppg: 16.2, rpg: 5.8, apg: 2.4, spg: 0.8, fg: "48%", team: "הפועל ת"א", rank: 4 },
  { id: "3", name: "איתי לוי", ppg: 14.1, rpg: 3.2, apg: 5.5, spg: 2.1, fg: "45%", team: "אליצור יבנה", rank: 7 },
  { id: "4", name: "אמיר כהן", ppg: 12.8, rpg: 7.1, apg: 1.2, spg: 0.5, fg: "55%", team: "מכבי רמת גן", rank: 12 },
];

const TrainingTab = () => {
  return (
    <div className="p-4 space-y-6 pb-28 text-right bg-[#020617]" dir="rtl">
      {/* Header Elite - עיצוב פרימיום */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 border border-purple-500/30 p-8 shadow-[0_0_40px_rgba(79,70,229,0.2)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-purple-500/50 shadow-inner">
            <Activity className="text-purple-400" size={38} />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">
              ELITE <span className="text-purple-500 font-display">PERFORMANCE</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase opacity-70 mt-1 font-bold">Analytics & Development System</p>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">V3.5.0</Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-3 py-1 font-bold">SCOUTING ACTIVE</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-slate-900/90 backdrop-blur-xl h-16 border border-white/10 p-1.5 rounded-2xl sticky top-4 z-50 shadow-2xl">
          <TabsTrigger value="workout" className="data-[state=active]:bg-purple-600 rounded-xl transition-all duration-300 text-xs">כושר</TabsTrigger>
          <TabsTrigger value="nutrition" className="data-[state=active]:bg-purple-600 rounded-xl transition-all duration-300 text-xs">תזונה</TabsTrigger>
          <TabsTrigger value="moves" className="data-[state=active]:bg-purple-600 rounded-xl transition-all duration-300 text-xs">מהלכים</TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-orange-600 rounded-xl font-bold text-orange-400 data-[state=active]:text-white text-xs transition-all duration-300">סקאוטינג 🌟</TabsTrigger>
        </TabsList>

        {/* --- טאב כושר מפורט --- */}
        <TabsContent value="workout" className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4 flex flex-col items-center gap-1">
                <Flame className="text-emerald-400" size={20} />
                <span className="text-[10px] text-slate-400 uppercase font-bold">קלוריות</span>
                <span className="text-xl font-bold text-white">2,850</span>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4 flex flex-col items-center gap-1">
                <Clock className="text-blue-400" size={20} />
                <span className="text-[10px] text-slate-400 uppercase font-bold">זמן אימון</span>
                <span className="text-xl font-bold text-white">95m</span>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-white/10 overflow-hidden shadow-xl">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <div className="flex justify-between items-center text-right">
                <Badge className="bg-purple-500 uppercase text-[10px] font-black">Elite Plan</Badge>
                <CardTitle className="text-lg font-bold flex items-center gap-2 italic">אימון כוח ופיצוץ <Trophy className="text-yellow-500" size={20}/></CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {[
                { name: "Trap Bar Deadlift", sets: "4x6", load: "85% RM" },
                { name: "Box Jumps (Depth)", sets: "3x8", load: "60cm" },
                { name: "Bulgarian Split Squat", sets: "3x10", load: "20kg" },
                { name: "Core: MedBall Slams", sets: "4x12", load: "8kg" }
              ].map((ex, i) => (
                <div key={i} className="flex justify-between items-center p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <ChevronRight size={16} className="text-slate-600" />
                  <div className="text-right">
                    <span className="font-bold text-sm text-white block uppercase tracking-tight">{ex.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{ex.sets} • {ex.load} • 90s מנוחה</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- טאב תזונה המלא --- */}
        <TabsContent value="nutrition" className="mt-8 space-y-6">
          <Card className="glass-card border-purple-500/20 p-6 shadow-2xl">
            <div className="space-y-6">
              <div className="flex gap-4 items-start border-r-2 border-purple-500/20 pr-4">
                <Sunrise className="text-yellow-500 shrink-0" size={24} />
                <div className="text-right">
                  <h4 className="font-bold text-white text-sm">ארוחת בוקר (07:30)</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">שיבולת שועל עם חלבון, אוכמניות, זרעי צ'יה וכף חמאת בוטנים טבעית.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1 h-full bg-orange-500"></div>
                <div className="flex justify-between items-center mb-2">
                  <Badge className="bg-orange-500 text-black font-black text-[8px] animate-pulse uppercase">Performance Trial 🧪</Badge>
                  <h4 className="font-bold text-orange-400 flex items-center gap-2 text-sm">נשנוש קדם-אימון אנרגטי</h4>
                </div>
                <p className="text-xs text-slate-200 italic pr-2 leading-relaxed font-medium">
                  2 תמרים מג'הול + חופן אגוזי מלך. השילוב מעלה את רמת הסוכר בדם בצורה מבוקרת ונותן אנרגיה מתפרצת למגרש.
                </p>
              </div>

              <div className="flex gap-4 items-start border-r-2 border-blue-500/20 pr-4">
                <Sun className="text-blue-400 shrink-0" size={24} />
                <div className="text-right">
                  <h4 className="font-bold text-white text-sm">ארוחת צהריים (13:30)</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">150 גרם פילה בקר או חזה עוף, כוס קינואה וירקות ירוקים מאודים (ברוקולי/שעועית).</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* --- טאב סקאוטינג המטורף (כאן כל הקוד הארוך) --- */}
        <TabsContent value="comparison" className="mt-8 space-y-6">
          <Card className="glass-card border-orange-500/40 bg-slate-950 overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.15)]">
            <div className="bg-orange-500 text-black text-center text-[10px] font-black py-1.5 uppercase tracking-[0.3em]">Live Scouting Analytics Report</div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-black text-orange-500 italic flex items-center justify-center gap-4">
                <Shield className="fill-orange-500" size={24} /> VS <Shield className="fill-orange-500" size={24} />
              </CardTitle>
              <CardDescription className="text-slate-500 uppercase text-[10px] font-bold tracking-widest mt-1">עונת 2026 | ליגת ילדים א'</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-12 relative">
                <div className="absolute left-1/2 -translate-x-1/2 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center border-4 border-slate-950 z-20 font-black italic text-black shadow-2xl">VS</div>
                
                {/* שחקן 1 */}
                <div className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-orange-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-5xl relative z-10 shadow-2xl">👤</div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-orange-500 text-lg leading-tight uppercase tracking-tighter">{leaguePlayers[0].name}</h3>
                    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[8px] mt-1 font-bold">{leaguePlayers[0].team}</Badge>
                  </div>
                </div>

                {/* שחקן 2 */}
                <div className="flex-1 flex flex-col items-center gap-4 opacity-70 grayscale-[0.5]">
                  <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-5xl shadow-xl">👤</div>
                  <div className="text-center">
                    <h3 className="font-black text-white text-lg leading-tight uppercase tracking-tighter">{leaguePlayers[1].name}</h3>
                    <Badge className="bg-white/5 text-slate-500 border-white/10 text-[8px] mt-1 font-bold">{leaguePlayers[1].team}</Badge>
                  </div>
                </div>
              </div>

              {/* גרפים של השוואה סטטיסטית */}
              <div className="space-y-8">
                {[
                  { label: "Points Per Game", p1: 18.5, p2: 16.2, max: 25, color: "bg-orange-500" },
                  { label: "Field Goal %", p1: 52, p2: 48, max: 100, color: "bg-purple-500" },
                  { label: "Rebounds Per Game", p1: 10.2, p2: 8.5, max: 15, color: "bg-green-500" },
                  { label: "Assists Per Game", p1: 7.1, p2: 6.3, max: 10, color: "bg-blue-500" },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 w-24">{stat.label}</span>
                    <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden relative">
                      <div className={`absolute left-0 top-0 h-4 ${stat.color}`} style={{ width: `${(stat.p1 / stat.max) * 100}%` }}></div>
                      <div className={`absolute right-0 top-0 h-4 ${stat.color} opacity-50`} style={{ width: `${(stat.p2 / stat.max) * 100}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-12 text-right">{stat.p1}</span>
                    <span className="text-xs font-bold text-slate-400 w-12 text-right">{stat.p2}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TrainingTab;