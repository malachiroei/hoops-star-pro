import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { HomeTab } from "@/components/HomeTab";
import { StatsTab } from "@/components/StatsTab";
import { ChallengesTab } from "@/components/ChallengesTab";
import { ProfileTab } from "@/components/ProfileTab";
import { TrainingTab } from "@/components/TrainingTab";
import { AICoach } from "@/components/AICoach";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "stats":
        return <StatsTab />;
      case "training":
        return <TrainingTab />;
      case "coach":
        return <AICoach />;
      case "profile":
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Main Content */}
      <main className="pb-24 max-w-lg mx-auto">
        {renderTab()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
