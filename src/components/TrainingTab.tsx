import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dumbbell, Utensils, Dribbble, Star, Sunrise, Sun, Moon, Cookie } from "lucide-react";

const leaguePlayers = [
  { id: "1", name: "רביד מלאכי", ppg: 18.5, mpg: 24.0, fg: "52%", avatar: "👤" },
  { id: "2", name: "דוד מזרחי", ppg: 16.2, mpg: 22.5, fg: "48%", avatar: "👤" },
];

const TrainingTab = () => {
  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center space-y-2 border-2 border-purple-500 rounded-lg p-3 bg-purple-500/10">
        <h1 className="text-2xl font-bold font-display text-purple-400">
          תוכנית אימונים - גרסת ניסוי 🧪
        </h1>
        <p className="text-purple-200/70 text-sm">סביבת עבודה: Scouting Mode</p>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-slate-900 h-12 border border-white/5">
          <TabsTrigger value="workout" className="text-[10px] sm:text-xs gap-1"><Dumbbell size={14}/>כושר</TabsTrigger>
          <TabsTrigger value="nutrition" className="text-[10px] sm:text-xs gap-1"><Utensils size={14}/>תזונה</TabsTrigger>
          <TabsTrigger value="moves" className="text-[10px] sm:text-xs gap-1"><Dribbble size={14}/>מהלכים</TabsTrigger>
          <TabsTrigger value="comparison" className="text-[10px] sm:text-xs gap-1"><Star size={14}/>סקאוטינג</TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="mt-4">
          <Card className="glass-card bg-slate-900/50 border-white/10">
            <CardHeader><CardTitle className="text-right">אימון יומי</CardTitle></CardHeader>
            <CardContent className="text-right text-sm text-slate-400">כאן יופיעו תרגילי הכושר המקצועיים שלך.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-4 space-y-4">
          <Card className="glass-card bg-slate-900/50 border-white/10">
            <CardHeader><CardTitle className="text-right">תפריט תזונה</CardTitle></CardHeader>
            <CardContent className="text-right text-sm text-slate-400 font-bold text-purple-400 italic">נשנושים של ניסוי 🧪 מופיעים כעת לפני ארוחת ערב.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moves" className="mt-4">
          <Card className="glass-card bg-slate-900/50 border-white/10">
            <CardHeader><CardTitle className="text-right">מהלכי כדורסל</CardTitle></CardHeader>
            <CardContent className="text-right text-sm text-slate-400">סרטוני הדרכה לשיפור השליטה בכדור.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card className="glass-card glow-border overflow-hidden bg-gradient-to-b from-slate-900 to-black border-primary/30">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-bold text-primary flex items-center justify-center gap-2" dir="rtl">
                <Star className="fill-primary" size={20} />
                ראש בראש: Scouting Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 relative text-right" dir="rtl">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/20 p-2 rounded-full border border-primary/40 z-10 font-bold text-[10px]">VS</div>
                
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-center space-y-3">
                  <div className="text-4xl">👤</div>
                  <h3 className="font-bold text-primary text-sm">{leaguePlayers[0].name}</h3>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Ppts:</span> <span className="font-mono font-bold text-white">{leaguePlayers[0].ppg}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Mins:</span> <span className="font-mono font-bold text-white">{leaguePlayers[0].mpg}</span></div>
                    <div className="flex justify-between"><span>FG%:</span> <span className="font-mono font-bold text-green-400">{leaguePlayers[0].fg}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center space-y-3">
                  <div className="text-4xl">👤</div>
                  <h3 className="font-bold text-white/90 text-sm">{leaguePlayers[1].name}</h3>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Ppts:</span> <span className="font-mono font-bold text-white">{leaguePlayers[1].ppg}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Mins:</span> <span className="font-mono font-bold text-white">{leaguePlayers[1].mpg}</span></div>
                    <div className="flex justify-between"><span>FG%:</span> <span className="font-mono font-bold text-yellow-400">{leaguePlayers[1].fg}</span></div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 text-xs h-9">שנה שחקנים להשוואה</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingTab;