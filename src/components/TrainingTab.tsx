import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dumbbell, Utensils, Dribbble, Star } from "lucide-react";

const leaguePlayers = [
  { id: "1", name: "רביד מלאכי", ppg: 18.5, fg: "52%" },
  { id: "2", name: "דוד מזרחי", ppg: 16.2, fg: "48%" },
];

const TrainingTab = () => {
  return (
    <div className="p-4 space-y-6 pb-20 text-right" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2 border-2 border-purple-500 rounded-lg p-3 bg-purple-500/10">
        <h1 className="text-2xl font-bold font-display text-purple-400">
          תוכנית אימונים - גרסת ניסוי 🧪
        </h1>
        <p className="text-purple-200/70 text-sm">סביבת עבודה: Scouting Mode</p>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-slate-900 h-12 border border-white/5">
          <TabsTrigger value="workout" className="text-[10px] sm:text-xs">כושר</TabsTrigger>
          <TabsTrigger value="nutrition" className="text-[10px] sm:text-xs">תזונה</TabsTrigger>
          <TabsTrigger value="moves" className="text-[10px] sm:text-xs">מהלכים</TabsTrigger>
          <TabsTrigger value="comparison" className="text-[10px] sm:text-xs font-bold text-orange-500">סקאוטינג 🌟</TabsTrigger>
        </TabsList>

        {/* טאב כושר */}
        <TabsContent value="workout" className="mt-4">
          <Card className="glass-card bg-slate-900/50 border-white/10">
            <CardHeader><CardTitle className="text-right">אימון יומי</CardTitle></CardHeader>
            <CardContent className="text-right text-sm text-slate-400">כאן יופיעו תרגילי הכושר המקצועיים שלך.</CardContent>
          </Card>
        </TabsContent>

        {/* טאב תזונה */}
        <TabsContent value="nutrition" className="mt-4">
          <Card className="glass-card bg-slate-900/50 border-white/10">
            <CardHeader><CardTitle className="text-right text-purple-400">תזונה לניסוי</CardTitle></CardHeader>
            <CardContent className="text-right text-sm text-slate-400">נשנושי ניסוי נוספו מעל ארוחת הערב.</CardContent>
          </Card>
        </TabsContent>

        {/* טאב מהלכים */}
        <TabsContent value="moves" className="mt-4">
          <Card className="glass-card bg-slate-900/50 border-white/10">
            <CardHeader><CardTitle className="text-right">מהלכי NBA</CardTitle></CardHeader>
            <CardContent className="text-right text-sm text-slate-400">שיפור השליטה בכדור וקליעה.</CardContent>
          </Card>
        </TabsContent>

        {/* טאב סקאוטינג - המערכת החדשה */}
        <TabsContent value="comparison" className="mt-4">
          <Card className="glass-card glow-border overflow-hidden bg-gradient-to-b from-slate-900 to-black border-orange-500/30">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-bold text-orange-500 flex items-center justify-center gap-2">
                <Star className="fill-orange-500" size={20} />
                ראש בראש: Scouting Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500/20 p-2 rounded-full border border-orange-500/40 z-10 font-bold text-[10px] text-white">VS</div>
                
                {/* שחקן 1 */}
                <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 text-center space-y-2">
                  <div className="text-3xl">👤</div>
                  <h3 className="font-bold text-orange-500 text-xs">{leaguePlayers[0].name}</h3>
                  <div className="text-[10px] space-y-1 text-white">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Ppts:</span> <b>{leaguePlayers[0].ppg}</b></div>
                    <div className="flex justify-between text-green-400"><span>FG%:</span> <b>{leaguePlayers[0].fg}</b></div>
                  </div>
                </div>

                {/* שחקן 2 */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center space-y-2">
                  <div className="text-3xl">👤</div>
                  <h3 className="font-bold text-white/90 text-xs">{leaguePlayers[1].name}</h3>
                  <div className="text-[10px] space-y-1 text-white">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Ppts:</span> <b>{leaguePlayers[1].ppg}</b></div>
                    <div className="flex justify-between text-yellow-400"><span>FG%:</span> <b>{leaguePlayers[1].fg}</b></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingTab;