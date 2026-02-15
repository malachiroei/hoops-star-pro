import { useState } from "react";
import { Dumbbell, Utensils, Check, Camera, Clock, MessageSquare, Flame, Zap, Timer, Loader2, Star, Lightbulb, Apple, Wheat, Drumstick, Sunrise, Sun, Moon, Cookie, Dribbble } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BasketballMovesTab } from "./Training/BasketballMovesTab";

// Meal images
import mealBreakfast from "@/assets/meal-breakfast.jpg";
import mealLunch from "@/assets/meal-lunch.jpg";
import mealDinner from "@/assets/meal-dinner.jpg";
import mealSnacks from "@/assets/meal-snacks.jpg";

interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  sets: string;
  icon: string;
  category: "strength" | "agility";
}

const exercises: Exercise[] = [
  { id: "pushups", name: "שכיבות סמיכה", nameEn: "Push-ups", sets: "3 × 15", icon: "💪", category: "strength" },
  { id: "squats", name: "סקוואטים", nameEn: "Squats", sets: "3 × 20", icon: "🦵", category: "strength" },
  { id: "planks", name: "פלאנק", nameEn: "Planks", sets: "3 × 45 שניות", icon: "🧘", category: "strength" },
  { id: "jumpingjacks", name: "קפיצות פיסוק", nameEn: "Jumping Jacks", sets: "3 × 30", icon: "⭐", category: "agility" },
  { id: "highknees", name: "ברכיים לחזה", nameEn: "High Knees", sets: "3 × 20", icon: "🏃", category: "agility" },
];

interface MealRecommendation {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

const mealRecommendations: MealRecommendation[] = [
  {
    id: "breakfast",
    title: "ארוחת בוקר של אלופים",
    description: "אנרגיה להתחלת היום: דייסת שיבולת שועל עם פירות, יוגורט חלבון עם גרנולה, או חביתה עם לחם מלא וירקות.",
    image: mealBreakfast,
    icon: <Sunrise size={18} />,
    bgColor: "from-orange-500/15 to-amber-500/10",
    borderColor: "border-orange-500/30"
  },
  {
    id: "lunch",
    title: "ארוחת צהריים לביצועים",
    description: "תדלוק מרכזי: חזה עוף/דג/טופו עם פחמימה מורכבת (אורז מלא/קינואה/בטטה) והרבה ירקות מבושלים או טריים.",
    image: mealLunch,
    icon: <Sun size={18} />,
    bgColor: "from-green-500/15 to-emerald-500/10",
    borderColor: "border-green-500/30"
  },
  {
    id: "snacks",
    title: "נשנושים של ניסוי 🧪", 
    description: "בוסט מהיר: פרי (בננה/תפוח), חופן שקדים ואגוזים, או חטיף חלבון איכותי לפני אימון.",
    image: mealSnacks,
    icon: <Cookie size={18} />,
    bgColor: "from-purple-500/15 to-pink-500/10",
    borderColor: "border-purple-500/30"
  },
  {
    id: "dinner",
    title: "ארוחת ערב להתאוששות",
    description: "בניית שריר בלילה: שקשוקה עשירה, סלט טונה עם ביצה קשה, או פסטה מקמח מלא עם רוטב עגבניות וגבינה רזה.",
    image: mealDinner,
    icon: <Moon size={18} />,
    bgColor: "from-blue-500/15 to-indigo-500/10",
    borderColor: "border-blue-500/30"
  },
];

interface MealAnalysis {
  score: number;
  status: "green" | "yellow" | "red";
  feedback: string;
  proTip: string;
  details: {
    protein: boolean;
    carbs: boolean;
    vegetables: boolean;
  };
}

interface UploadedMeal {
  id: string;
  timestamp: Date;
  imageUrl: string | null;
  description: string;
  analysis: MealAnalysis | null;
  isAnalyzing: boolean;
}

const mealDescriptions = [
  "עוף עם אורז וסלט ירקות",
  "פסטה ברוטב עגבניות עם גבינה",
  "שניצל עם פירה וירקות מבושלים",
  "סלט טונה עם לחם מלא",
  "ביצים מקושקשות עם ירקות וטוסט",
  "המבורגר עם צ'יפס",
  "פיצה עם תוספות",
  "סטייק עם תפוחי אדמה וסלט",
];

export const TrainingTab = () => {
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [uploadedMeals, setUploadedMeals] = useState<UploadedMeal[]>([]);

  const toggleExercise = (id: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const analyzeMeal = async (mealId: string, description: string) => {
    setUploadedMeals(prev => 
      prev.map(meal => 
        meal.id === mealId ? { ...meal, isAnalyzing: true } : meal
      )
    );

    try {
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { 
          mealDescription: description,
          mealType: getMealType(new Date())
        }
      });

      if (error) throw error;

      setUploadedMeals(prev => 
        prev.map(meal => 
          meal.id === mealId 
            ? { ...meal, analysis: data as MealAnalysis, isAnalyzing: false } 
            : meal
        )
      );

      toast.success("הארוחה נותחה בהצלחה!");
    } catch (error) {
      console.error("Error analyzing meal:", error);
      toast.error("שגיאה בניתוח הארוחה, נסה שוב");
      setUploadedMeals(prev => 
        prev.map(meal => 
          meal.id === mealId ? { ...meal, isAnalyzing: false } : meal
        )
      );
    }
  };

  const getMealType = (date: Date): string => {
    const hour = date.getHours();
    if (hour < 10) return "ארוחת בוקר";
    if (hour < 14) return "ארוחת צהריים";
    if (hour < 17) return "ארוחת ביניים";
    return "ארוחת ערב";
  };

  const handleMealUpload = () => {
    const randomDescription = mealDescriptions[Math.floor(Math.random() * mealDescriptions.length)];
    const newMeal: UploadedMeal = {
      id: Date.now().toString(),
      timestamp: new Date(),
      imageUrl: null,
      description: randomDescription,
      analysis: null,
      isAnalyzing: false,
    };
    setUploadedMeals(prev => [newMeal, ...prev]);
    setTimeout(() => analyzeMeal(newMeal.id, randomDescription), 500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  };

  const strengthExercises = exercises.filter(e => e.category === "strength");
  const agilityExercises = exercises.filter(e => e.category === "agility");
  const completedCount = completedExercises.size;
  const totalCount = exercises.length;
  const progress = (completedCount / totalCount) * 100;

return (
    <div className="p-4 space-y-6">
      {/* Header - גרסת ניסוי סגולה */}
      <div className="text-center space-y-2 border-2 border-purple-500 rounded-lg p-3 bg-purple-500/10">
        <h1 className="text-2xl font-bold font-display">
          <span className="text-purple-400">תוכנית אימונים - גרסת ניסוי 🧪</span>
        </h1>
        <p className="text-purple-200/70 text-sm font-bold">
          סביבת עבודה: test-env
        </p>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-surface-dark/80">
          <TabsTrigger value="workout" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1 text-xs sm:text-sm">
            <Dumbbell size={14} />
            <span className="hidden sm:inline">אימון כושר</span>
            <span className="sm:hidden">כושר</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1 text-xs sm:text-sm">
            <Utensils size={14} />
            תזונה
          </TabsTrigger>
          <TabsTrigger value="moves" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1 text-xs sm:text-sm">
            <Dribbble size={14} />
            <span className="hidden sm:inline">מהלכים בכדורסל</span>
            <span className="sm:hidden">מהלכים</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="mt-4 space-y-4">
          <Card className="glass-card glow-border overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="text-primary" size={20} />
                  <span className="font-semibold">התקדמות יומית</span>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {completedCount}/{totalCount}
                </Badge>
              </div>
              <div className="w-full h-3 bg-surface-dark rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {completedCount === totalCount && (
                <p className="text-center text-primary mt-2 text-sm font-medium animate-pulse">
                  🎉 כל הכבוד! סיימת את האימון היומי!
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Dumbbell className="text-primary" size={18} />
              <h2 className="font-semibold text-lg">חיזוק שרירים</h2>
            </div>
            {strengthExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isCompleted={completedExercises.has(exercise.id)}
                onToggle={() => toggleExercise(exercise.id)}
              />
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Zap className="text-yellow-400" size={18} />
              <h2 className="font-semibold text-lg">זריזות ומהירות</h2>
            </div>
            {agilityExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isCompleted={completedExercises.has(exercise.id)}
                onToggle={() => toggleExercise(exercise.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-4 space-y-4">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">🍽️</span>
                תפריט האלוף שלך
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mealRecommendations.map((meal) => (
                <MealRecommendationCard key={meal.id} meal={meal} />
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card glow-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="text-primary" size={20} />
                העלאת ארוחה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                צלמו את הארוחה שלכם וקבלו משוב מהמאמן
              </p>
              <Button 
                onClick={handleMealUpload}
                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 gap-2"
              >
                <Camera size={18} />
                העלה תמונה של הארוחה
              </Button>

              {uploadedMeals.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Timer size={16} className="text-muted-foreground" />
                    הארוחות שלי
                  </h3>
                  {uploadedMeals.map((meal) => (
                    <MealCard 
                      key={meal.id} 
                      meal={meal} 
                      formatTime={formatTime}
                      formatDate={formatDate}
                      getMealType={getMealType}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moves" className="mt-4">
          <BasketballMovesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  onToggle: () => void;
}

function ExerciseCard({ exercise, isCompleted, onToggle }: ExerciseCardProps) {
  return (
    <Card 
      className={`glass-card overflow-hidden transition-all duration-300 cursor-pointer ${
        isCompleted ? 'border-primary/50 bg-primary/10' : ''
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Checkbox 
              checked={isCompleted}
              className="h-6 w-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            isCompleted ? 'bg-primary/20' : 'bg-surface-dark'
          }`}>
            {exercise.icon}
          </div>
          <div className="flex-grow">
            <h3 className={`font-semibold ${isCompleted ? 'text-primary' : ''}`}>
              {exercise.name}
            </h3>
            <p className="text-muted-foreground text-xs">{exercise.nameEn}</p>
          </div>
          <Badge 
            variant="outline" 
            className={`${isCompleted ? 'border-primary text-primary bg-primary/10' : 'border-border'}`}
          >
            {exercise.sets}
          </Badge>
          {isCompleted && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check size={14} className="text-primary-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MealRecommendationCard({ meal }: { meal: MealRecommendation }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${meal.bgColor} border ${meal.borderColor} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex gap-4 p-4">
        <div className="flex-shrink-0">
          <img 
            src={meal.image} 
            alt={meal.title}
            className="w-20 h-20 rounded-lg object-cover shadow-lg"
          />
        </div>
        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-background/50 text-primary">
              {meal.icon}
            </div>
            <h3 className="font-semibold text-sm">{meal.title}</h3>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {meal.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal, formatTime, formatDate, getMealType }: MealCardProps) {
  const getStatusColor = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
    }
  };

  const getStatusBgColor = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green": return "from-green-500/20 to-emerald-500/20 border-green-500/30";
      case "yellow": return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case "red": return "from-red-500/20 to-orange-500/20 border-red-500/30";
    }
  };

  return (
    <div className="p-4 rounded-xl bg-surface-dark/50 border border-border/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={14} />
          <span>{getMealType(meal.timestamp)} | {formatTime(meal.timestamp)} | {formatDate(meal.timestamp)}</span>
        </div>
        {meal.analysis && (
          <div className={`w-3 h-3 rounded-full ${getStatusColor(meal.analysis.status)} animate-pulse`} />
        )}
      </div>

      <div className="aspect-video rounded-lg bg-gradient-to-br from-surface-dark to-background border border-dashed border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Camera size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs">{meal.description}</p>
        </div>
      </div>

      {meal.isAnalyzing && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-sm text-primary">מנתח את הארוחה...</span>
        </div>
      )}

      {meal.analysis && !meal.isAnalyzing && (
        <div className="space-y-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${getStatusBgColor(meal.analysis.status)} border`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-400" size={18} />
                <span className="font-semibold text-sm">ציון תזונה</span>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-lg font-bold ${
                  meal.analysis.status === 'green' ? 'bg-green-500/20 text-green-400' :
                  meal.analysis.status === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}
              >
                {meal.analysis.score}/10
              </Badge>
            </div>
            <div className="flex gap-2 mt-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${meal.analysis.details.protein ? 'bg-green-500/20 text-green-400' : 'bg-muted/50 text-muted-foreground'}`}>
                <Drumstick size={12} /> חלבון
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${meal.analysis.details.carbs ? 'bg-green-500/20 text-green-400' : 'bg-muted/50 text-muted-foreground'}`}>
                <Wheat size={12} /> פחמימות
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${meal.analysis.details.vegetables ? 'bg-green-500/20 text-green-400' : 'bg-muted/50 text-muted-foreground'}`}>
                <Apple size={12} /> ירקות
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <MessageSquare size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{meal.analysis.feedback}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-yellow-400">טיפ מקצועי:</span>
                <p className="text-xs text-muted-foreground mt-1">{meal.analysis.proTip}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}