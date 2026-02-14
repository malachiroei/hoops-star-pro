import { useState } from "react";
import { HomeTab } from "@/components/HomeTab";
import { GamesTab } from "@/components/GamesTab";
import StatsTab from "@/components/StatsTab";
import TrainingTab from "@/components/Training/TrainingTab";
import ProfileTab from "@/components/ProfileTab";
import CoachTab from "@/components/AICoach/CoachTab";
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
        return <CoachTab />;
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