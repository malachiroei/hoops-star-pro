import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, Utensils, Dribbble, Star, 
  Sunrise, Sun, Cookie, Target, 
  Activity, Trophy, BarChart3, Zap, Shield, ChevronRight
} from "lucide-react";

const leaguePlayers = [
  { id: "1", name: "רביד מלאכי", ppg: 18.5, rpg: 4.2, apg: 3.1, fg: "52%", team: "מכבי רמת גן" },
  { id: "2", name: "דוד מזרחי", ppg: 16.2, rpg: 5.8, apg: 2.4, fg: "48%", team: "הפועל ת"א" },
];

const TrainingTab = () => {
  return (
    <div className="p-4 space-y-6 pb-28 text-right bg-[#020617]" dir="rtl">
      {/* Header Elite */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 border border-purple-500/30 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-purple-500/50">
            <Activity className="text-purple-400" size={38} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            ELITE <span className="text-purple-500">HUB</span>
          </h1>
          <div className="flex gap-3 mt-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">V2.6</Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">SCOUTING ACTIVE</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-slate-900/90 backdrop-blur-xl h-16 border border-white/10 p-1.5 rounded-2xl sticky top-4 z-50 shadow-2xl">
          <TabsTrigger value="workout" className="data-[state=active]:bg-purple-600 rounded-xl transition-all">כושר</TabsTrigger>
          <TabsTrigger value="nutrition" className="data-[state=active]:bg-purple-600 rounded-xl transition-all">תזונה</TabsTrigger>
          <TabsTrigger value="moves" className="data-[state=active]:bg-purple-600 rounded-xl transition-all">מהלכים</TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-orange-600 rounded-xl font-bold text-orange-400 data-[state=active]:text-white">סקאוטינג 🌟</TabsTrigger>
        </TabsList>

        {/* טאב כושר */}
        <TabsContent value="workout" className="mt-8 space-y-6">
          <Card className="glass-card border-white/10 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5 text-right">
              <CardTitle className="text-lg flex items-center justify-end gap-2">אימון כוח מתפרץ <Trophy className="text-yellow-500" size={20}/></CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {[{ name: "Trap Bar Deadlift", sets: "4x6" }, { name: "Box Jumps", sets: "3x10" }].map((ex, i) => (
                <div key={i} className="flex justify-between items-center p-4 border-b border-white/5 last:border-0">
                  <ChevronRight size={16} className="text-slate-600" />
                  <div className="text-right">
                    <span className="font-bold text-sm text-white block">{ex.name}</span>
                    <span className="text-[10px] text-slate-500">{ex.sets} • 90s מנוחה</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* טאב תזונה */}
        <TabsContent value="nutrition" className="mt-8 space-y-6">
          <Card className="glass-card border-purple-500/20 p-6">
             <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-orange-500"></div>
                <Badge className="mb-2 bg-orange-500 text-black font-bold text-[8px]">ניסוי 🧪</Badge>
                <h4 className="font-bold text-orange-400 flex items-center gap-2 mb-1">נשנוש קדם-אימון <Cookie size={18}/></h4>
                <p className="text-sm text-slate-300 italic">חופן אגוזי מלך ו-2 תמרים לאנרגיה מתפרצת.</p>
             </div>
          </Card>
        </TabsContent>

        {/* טאב סקאוטינג - הגרפיקה שרצית */}
        <TabsContent value="comparison" className="mt-8 space-y-6">
          <Card className="glass-card border-orange-500/40 bg-slate-950 overflow-hidden p-8">
            <div className="flex justify-between items-center mb-12 relative">
              <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center border-4 border-slate-950 z-20 font-black italic text-black shadow-2xl">VS</div>
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-4xl">👤</div>
                <h3 className="font-black text-orange-500 text-sm uppercase">{leaguePlayers[0].name}</h3>
              </div>
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-4xl">👤</div>
                <h3 className="font-black text-white text-sm uppercase">{leaguePlayers[1].name}</h3>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: "Points", p1: 18.5, p2: 16.2, max: 25 },
                { label: "FG%", p1: 52, p2: 48, max: 70 }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 px-1">
                    <span>{stat.p2}</span><span className="text-white">{stat.label}</span><span>{stat.p1}</span>
                  </div>
                  <div className="flex h-2 gap-1">
                    <div className="flex-1 flex justify-end"><div className="bg-orange-500 rounded-l-full" style={{ width: `${(stat.p1/stat.max)*100}%` }}></div></div>
                    <div className="flex-1 bg-white/5 rounded-r-full overflow-hidden"><div className="bg-slate-600 h-full" style={{ width: `${(stat.p2/stat.max)*100}%` }}></div></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-right">
               <h4 className="text-xs font-bold text-orange-500 mb-1 flex items-center justify-end gap-1"><BarChart3 size={14}/> סיכום סקאוט</h4>
               <p className="text-[11px] text-slate-400 leading-relaxed italic">רביד מוביל ביעילות התקפית. מומלץ לחץ על הכדור בפרימטר.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingTab;export default TrainingTab;export default TrainingTab;                  <div className="absolute -right-[33px] top-1 w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>