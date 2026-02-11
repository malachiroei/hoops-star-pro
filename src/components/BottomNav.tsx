import { Home, BarChart3, Target, User, Dumbbell, MessageSquare } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "בית", labelEn: "Home", icon: Home },
  { id: "stats", label: "סטטיסטיקות", labelEn: "Stats", icon: BarChart3 },
  { id: "training", label: "אימונים", labelEn: "Training", icon: Dumbbell },
  { id: "coach", label: "מאמן AI", labelEn: "AI Coach", icon: MessageSquare },
  { id: "profile", label: "פרופיל", labelEn: "Profile", icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark/95 backdrop-blur-lg border-t border-border">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCoach = tab.id === "coach";
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`nav-item ${isActive ? "active" : ""} relative group`}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary shadow-glow" />
              )}
              <div className={`relative ${isCoach && !isActive ? "animate-pulse" : ""}`}>
                <Icon 
                  size={24} 
                  className={`transition-all duration-300 ${
                    isActive ? "text-primary scale-110" : isCoach ? "text-primary/70 group-hover:text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {isCoach && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-ping" />
                )}
              </div>
              <span className={`text-xs font-medium transition-colors ${
                isActive ? "text-primary" : isCoach ? "text-primary/70" : "text-muted-foreground"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
