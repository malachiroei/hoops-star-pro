import { useState } from "react";
import { HomeTab } from "@/components/HomeTab";
import { GamesTab } from "@/components/GamesTab";
import { StatsTab } from "@/components/StatsTab";     // עכשיו עם סוגריים - בדקתי בקוד שלך
import { TrainingTab } from "@/components/TrainingTab"; // עכשיו עם סוגריים - בדקתי בקוד שלך
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
      <main>
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;