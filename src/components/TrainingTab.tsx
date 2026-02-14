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
    id: "dinner",
    title: "ארוחת ערב להתאוששות",
    description: "בניית שריר בלילה: שקשוקה עשירה, סלט טונה עם ביצה קשה, או פסטה מקמח מלא עם רוטב עגבניות וגבינה רזה.",
    image: mealDinner,
    icon: <Moon size={18} />,
    bgColor: "from-blue-500/15 to-indigo-500/10",
    borderColor: "border-blue-500/30"
  },
  {
    id: "snacks",
    title: "נשנושים בריאים", // השם עודכן כאן
    description: "בוסט מהיר: פרי (בננה/תפוח), חופן שקדים ואגוזים, או חטיף חלבון איכותי לפני אימון.",
    image: mealSnacks,
    icon: <Cookie size={18} />,
    bgColor: "from-purple-500/15 to-pink-500/10",
    borderColor: "border-purple-500/30"
  },
];