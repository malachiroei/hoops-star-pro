import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Video, Heart, Target, Sparkles, ChevronLeft } from "lucide-react";
import { CoachChat } from "./CoachChat";

interface AICoachProps {
  embedded?: boolean;
}

export function AICoach({ embedded = false }: AICoachProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (isChatOpen) {
    return <CoachChat onBack={() => setIsChatOpen(false)} />;
  }

  const features = [
    {
      icon: Heart,
      title: "תמיכה רגשית",
      description: "שיחות אחרי משחקים קשים, עידוד ומוטיבציה",
      color: "from-pink-500 to-red-500",
    },
    {
      icon: Video,
      title: "ניתוח וידאו",
      description: "העלה סרטון וקבל משוב מפורט על הטכניקה שלך",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "הכנה למשחקים",
      description: "טיפים והכנה מנטלית למשחק הבא שלך",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: MessageSquare,
      title: "זמין 24/7",
      description: "שאל כל שאלה בכל זמן - המאמן תמיד פה",
      color: "from-primary to-orange-500",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-4xl shadow-lg shadow-primary/30 animate-pulse-glow">
          🏀
        </div>
        <h1 className="text-2xl font-bold font-display">
          <span className="text-gradient">המאמן האישי</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          AI מתקדם שילווה אותך בדרך להצלחה
        </p>
      </div>

      {/* Next Game Banner */}
      <Card className="glass-card glow-border overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                ⚡
              </div>
              <div>
                <p className="text-xs text-muted-foreground">המשחק הבא</p>
                <p className="font-bold">מכבי תל אביב צפון</p>
                <p className="text-xs text-primary">26 בפברואר</p>
              </div>
            </div>
            <Sparkles className="text-primary" size={24} />
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="glass-card overflow-hidden">
              <CardContent className="p-4 text-center space-y-2">
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA Button */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className="w-full h-14 text-lg bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 gap-3 shadow-lg shadow-primary/30"
      >
        <MessageSquare size={22} />
        התחל שיחה עם המאמן
        <ChevronLeft size={20} />
      </Button>

      {/* Team Info */}
      <div className="text-center text-xs text-muted-foreground">
        <p>רביד | בני יהודה תל אביב 🏀</p>
      </div>
    </div>
  );
}
