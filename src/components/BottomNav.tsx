import { Home, Calendar, BarChart2, Dumbbell, MessageSquare, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { id: "home", label: "בית", icon: Home },
    { id: "games", label: "משחקים", icon: Calendar },
    { id: "stats", label: "סטטיסטיקה", icon: BarChart2 },
    { id: "training", label: "אימונים", icon: Dumbbell },
    { id: "coach", label: "מאמן AI", icon: MessageSquare },
    { id: "profile", label: "פרופיל", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-white/10 px-2 py-3 backdrop-blur-lg z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === item.id ? "text-orange-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};