import { useState } from "react";
import { HomeTab } from "@/components/HomeTab";
import { GamesTab } from "@/components/GamesTab";
import StatsTab from "@/components/StatsTab";     // בלי סוגריים מסולסלים
import TrainingTab from "@/components/TrainingTab"; // בלי סוגריים מסולסלים
import CoachTab from "@/components/CoachTab";       // בלי סוגריים מסולסלים
import ProfileTab from "@/components/ProfileTab";   // בלי סוגריים מסולסלים
import { BottomNav } from "@/components/BottomNav";
const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  // פונקציה לבחירת התוכן להצגה לפי הטאב הנבחר
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
        return <CoachTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* התוכן המשתנה */}
      <main>
        {renderContent()}
      </main>

      {/* תפריט ניווט תחתון */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;