import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { HomeTab } from "@/components/HomeTab";
import { GamesTab } from "@/components/GamesTab";
import { StatsTab } from "@/components/StatsTab";     // עכשיו עם סוגריים - בדקתי בקוד שלך
import TrainingTab from "@/components/TrainingTab";
import { ProfileTab } from "@/components/ProfileTab";   // עכשיו עם סוגריים - בדקתי בקוד שלך
import { CoachChat } from "@/components/AICoach/CoachChat"; // שיניתי ל-CoachChat לפי הקוד ששלחת
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "games":
        return <GamesTab />;
      case "stats":
        return <StatsTab />;
      case "training":
        return <TrainingTab />;
      case "coach":
        // המאמן שלך דורש פונקציית חזרה, הוספתי אותה כדי שלא תהיה שגיאה
        return <CoachChat onBack={() => setActiveTab("home")} />;
      case "profile":
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="sticky top-0 z-40 flex justify-center p-2 bg-gray-100">
        <Badge className="bg-red-100 text-red-700 border border-red-300 font-semibold text-sm px-4 py-2">
          🧪 גרסת בדיקות - Test Environment
        </Badge>
      </div>
      <main>
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;