import { useState } from "react";
import { HomeTab } from "@/components/HomeTab";
import { GamesTab } from "@/components/GamesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, CalendarDays } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Tabs defaultValue="standings" className="w-full">
        {/* תוכן הטאבים */}
        <div className="container mx-auto">
          <TabsContent value="standings">
            <HomeTab />
          </TabsContent>
          <TabsContent value="games">
            <GamesTab />
          </TabsContent>
        </div>

        {/* תפריט ניווט תחתון */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border">
          <TabsList className="grid w-full grid-cols-2 h-16 bg-transparent">
            <TabsTrigger 
              value="standings" 
              className="flex flex-col gap-1 data-[state=active]:text-primary"
            >
              <Trophy size={20} />
              <span className="text-[10px] font-bold">טבלה</span>
            </TabsTrigger>
            <TabsTrigger 
              value="games" 
              className="flex flex-col gap-1 data-[state=active]:text-primary"
            >
              <CalendarDays size={20} />
              <span className="text-[10px] font-bold">משחקים</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default Index;