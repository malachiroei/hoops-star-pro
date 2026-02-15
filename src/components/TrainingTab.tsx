import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Activity, Dumbbell, Utensils } from "lucide-react";

const TrainingTab = () => {
  return (
    <div className="p-4 space-y-6 pb-20 text-right" dir="rtl">
      <div className="text-center p-4 border-2 border-orange-500 rounded-xl bg-orange-500/10">
        <h1 className="text-2xl font-bold text-orange-500 italic">ELITE SCOUTING HUB 🏀</h1>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-slate-900 h-12 border border-white/10">
          <TabsTrigger value="workout">כושר</TabsTrigger>
          <TabsTrigger value="nutrition">תזונה</TabsTrigger>
          <TabsTrigger value="moves">מהלכים</TabsTrigger>
          <TabsTrigger value="comparison" className="text-orange-500 font-bold">סקאוטינג</TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="mt-4">
          <Card className="bg-slate-900 border-white/10 p-4">
            <h3 className="text-white font-bold">תוכנית אימון</h3>
            <p className="text-slate-400 text-sm italic">אימון כוח מתפרץ וזריקות.</p>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-4">
          <Card className="bg-slate-900 border-orange-500/30 p-4">
            <h3 className="text-orange-500 font-bold">ניסוי תזונה 🧪</h3>
            <p className="text-slate-300 text-sm">נשנוש תמרים ואגוזים לפני אימון.</p>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card className="bg-slate-950 border-orange-500/50 p-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <div className="flex justify-between items-center mb-8 relative">
              <div className="absolute left-1/2 -translate-x-1/2 bg-orange-500 text-black font-black p-2 rounded-full text-xs z-10">VS</div>
              <div className="text-center flex-1">
                <div className="text-3xl mb-1">👤</div>
                <div className="text-orange-500 font-bold text-xs">רביד מלאכי</div>
                <div className="text-[10px] text-white">18.5 PPG</div>
              </div>
              <div className="text-center flex-1 opacity-60">
                <div className="text-3xl mb-1">👤</div>
                <div className="text-white font-bold text-xs">דוד מזרחי</div>
                <div className="text-[10px] text-slate-400">16.2 PPG</div>
              </div>
            </div>
            <div className="space-y-4">
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                  <div className="bg-orange-500 h-full" style={{width: '60%'}}></div>
                  <div className="bg-slate-600 h-full" style={{width: '40%'}}></div>
               </div>
               <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest">Live Stats Comparison</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="moves" className="mt-4">
          <Card className="bg-slate-900 border-white/10 p-4 text-center text-slate-500 italic">מהלכי NBA בטעינה...</Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingTab;export default TrainingTab;export default TrainingTab;export default TrainingTab;                  <div className="absolute -right-[33px] top-1 w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>