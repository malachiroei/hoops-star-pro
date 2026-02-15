<TabsList className="w-full grid grid-cols-4 bg-surface-dark/80">
  <TabsTrigger value="workout" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1 text-[10px] sm:text-sm">
    <Dumbbell size={14} />
    <span>כושר</span>
  </TabsTrigger>
  <TabsTrigger value="nutrition" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1 text-[10px] sm:text-sm">
    <Utensils size={14} />
    <span>תזונה</span>
  </TabsTrigger>
  <TabsTrigger value="moves" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1 text-[10px] sm:text-sm">
    <Dribbble size={14} />
    <span>מהלכים</span>
  </TabsTrigger>
  <TabsTrigger value="comparison" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1 text-[10px] sm:text-sm">
    <Star size={14} />
    <span>סקאוטינג</span>
  </TabsTrigger>
</TabsList>}