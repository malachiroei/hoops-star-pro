import { useState } from "react";
import { HomeTab } from "@/components/HomeTab";
import { GamesTab } from "@/components/GamesTab"; // ייבוא הקומפוננטה החדשה
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
        return <div className="p-8 text-center text-muted-foreground">סטטיסטיקות (בקרוב)</div>;
      case "training":
        return <div className="p-8 text-center text-muted-foreground">תוכניות אימונים (בקרוב)</div>;
      case "coach":
        return <div className="p-8 text-center text-muted-foreground">מאמן AI אישי (בקרוב)</div>;
      case "profile":
        return <div className="p-8 text-center text-muted-foreground">פרופיל שחקן (בקרוב)</div>;
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