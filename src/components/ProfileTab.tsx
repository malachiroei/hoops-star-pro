import { Sparkles, Edit3, Settings, Play, Trophy, Target, Zap, Palette, Lock, Check, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState, useRef } from "react";
import { ShotMap } from "./ShotMap";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Skin definitions
const skins = [
  {
    id: "classic",
    name: "קלאסי",
    nameEn: "Classic",
    description: "הסגנון המקורי עם כתום וזהב",
    locked: false,
    unlockCondition: null,
    gradient: "linear-gradient(180deg, hsl(0 0% 10%), hsl(0 0% 6%))",
    border: "hsl(24 100% 50%)",
    glow: "hsl(24 100% 50% / 0.4)",
    accentColor: "#ff6b00",
    icon: "🔥",
  },
  {
    id: "bnei-yehuda",
    name: "גיבור בני יהודה",
    nameEn: "Bnei Yehuda Hero",
    description: "עיצוב מיוחד עם האריה של הקבוצה",
    locked: false,
    unlockCondition: null,
    gradient: "linear-gradient(180deg, hsl(210 80% 15%), hsl(210 80% 8%))",
    border: "hsl(210 80% 50%)",
    glow: "hsl(210 80% 50% / 0.4)",
    accentColor: "#2196F3",
    icon: "🦁",
  },
  {
    id: "mvp-gold",
    name: "MVP מוזהב",
    nameEn: "MVP Gold",
    description: "נעול - השלם 3 אתגרים כדי לפתוח",
    locked: true,
    unlockCondition: "השלם 3 אתגרים",
    gradient: "linear-gradient(180deg, hsl(45 80% 20%), hsl(45 60% 10%))",
    border: "hsl(45 100% 50%)",
    glow: "hsl(45 100% 50% / 0.5)",
    accentColor: "#FFD700",
    icon: "👑",
  },
  {
    id: "neon-night",
    name: "לילה ניאון",
    nameEn: "Neon Night",
    description: "עיצוב כהה עם קווי ניאון כחולים",
    locked: false,
    unlockCondition: null,
    gradient: "linear-gradient(180deg, hsl(240 50% 8%), hsl(240 50% 4%))",
    border: "hsl(200 100% 50%)",
    glow: "hsl(200 100% 50% / 0.5)",
    accentColor: "#00d4ff",
    icon: "💎",
  },
];

type Skin = typeof skins[0];

interface ProfileTabProps {
  onLogout?: () => void;
}

export function ProfileTab({ onLogout }: ProfileTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<Skin>(skins[0]);
  const [isSkinDialogOpen, setIsSkinDialogOpen] = useState(false);
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleGenerateAvatar = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleSelectSkin = (skin: Skin) => {
    if (!skin.locked) {
      setSelectedSkin(skin);
      setIsSkinDialogOpen(false);
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentSkinIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentSkinIndex(prev => Math.min(skins.length - 1, prev + 1));
    }
  };

  const quickStats = [
    { label: "PTS", labelHe: "נקודות", value: "18.5", color: "text-primary" },
    { label: "AST", labelHe: "אסיסטים", value: "4.2", color: "text-emerald-400" },
    { label: "REB", labelHe: "ריבאונדים", value: "7.8", color: "text-sky-400" },
  ];

  const highlights = [
    { title: "טריפל דאבל מטורף", titleEn: "Crazy Triple Double", duration: "2:34" },
    { title: "קליעות מרחוק", titleEn: "Deep Threes", duration: "1:45" },
    { title: "הגנה אגרסיבית", titleEn: "Lockdown Defense", duration: "3:12" },
  ];

  const achievements = [
    { icon: Trophy, label: "MVP", unlocked: true },
    { icon: Target, label: "צלף", unlocked: true },
    { icon: Zap, label: "מהיר", unlocked: true },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Basketball Court Texture Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated via-background to-background" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              ${selectedSkin.accentColor}4D 40px,
              ${selectedSkin.accentColor}4D 41px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              ${selectedSkin.accentColor}4D 40px,
              ${selectedSkin.accentColor}4D 41px
            )
          `,
        }}
      />
      {/* Center Court Circle */}
      <div 
        className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-20" 
        style={{ border: `1px solid ${selectedSkin.accentColor}20` }}
      />
      <div 
        className="absolute top-32 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-20" 
        style={{ border: `1px solid ${selectedSkin.accentColor}20` }}
      />

      <div className="relative px-4 py-6 animate-fade-in">
        {/* Player Card Header */}
        <div 
          className="rounded-3xl p-6 mb-6 relative overflow-hidden transition-all duration-500"
          style={{ 
            background: selectedSkin.gradient,
            border: `2px solid ${selectedSkin.border}`,
            boxShadow: `0 0 30px ${selectedSkin.glow}, inset 0 0 30px ${selectedSkin.glow}`
          }}
        >
          {/* Background Glow Effects */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[100px]" 
            style={{ backgroundColor: `${selectedSkin.accentColor}20` }}
          />
          <div 
            className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full blur-[60px]" 
            style={{ backgroundColor: `${selectedSkin.accentColor}10` }}
          />
          
          {/* Skin Badge */}
          <div 
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            style={{ 
              backgroundColor: `${selectedSkin.accentColor}20`,
              border: `1px solid ${selectedSkin.accentColor}50`,
              color: selectedSkin.accentColor
            }}
          >
            <span>{selectedSkin.icon}</span>
            <span>{selectedSkin.name}</span>
          </div>

          {/* Settings & Customize Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setIsSkinDialogOpen(true)}
              className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur-sm flex items-center justify-center border border-border/50 transition-all hover:scale-110"
              style={{ borderColor: `${selectedSkin.accentColor}50` }}
            >
              <Palette style={{ color: selectedSkin.accentColor }} size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur-sm flex items-center justify-center border border-border/50 transition-all hover:border-primary/50">
              <Settings className="text-muted-foreground" size={20} />
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur-sm flex items-center justify-center border border-border/50 transition-all hover:scale-110"
                title="تسجيل الخروج"
              >
                <LogOut className="text-destructive" size={20} />
              </button>
            )}
          </div>

          {/* Avatar Section */}
          <div className="relative mx-auto w-36 h-36 mb-6">
            {/* Outer Glowing Ring */}
            <div 
              className="absolute inset-0 rounded-full animate-pulse-glow" 
              style={{ 
                background: `linear-gradient(135deg, ${selectedSkin.accentColor}, ${selectedSkin.accentColor}88)`,
                padding: '4px',
                boxShadow: `0 0 30px ${selectedSkin.glow}`
              }}
            >
              <div className="w-full h-full rounded-full bg-background" />
            </div>
            {/* Inner Avatar Container */}
            <div 
              className="absolute inset-1 rounded-full overflow-hidden border-2"
              style={{ borderColor: `${selectedSkin.accentColor}80` }}
            >
              <div className="w-full h-full bg-gradient-to-br from-surface-elevated to-background flex items-center justify-center">
                <span className="text-6xl">{selectedSkin.id === 'bnei-yehuda' ? '🦁' : '🏀'}</span>
              </div>
            </div>
            {/* Edit Button */}
            <button 
              className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full flex items-center justify-center shadow-glow border-2 border-background transition-transform hover:scale-110"
              style={{ 
                background: `linear-gradient(135deg, ${selectedSkin.accentColor}, ${selectedSkin.accentColor}cc)`,
                boxShadow: `0 4px 20px ${selectedSkin.glow}`
              }}
            >
              <Edit3 className="text-white" size={18} />
            </button>
            {/* Level Badge */}
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ 
                background: `linear-gradient(135deg, ${selectedSkin.accentColor}, ${selectedSkin.accentColor}cc)`,
                boxShadow: `0 4px 20px ${selectedSkin.glow}`
              }}
            >
              LVL 42
            </div>
          </div>

          {/* Player Name & Info */}
          <div className="text-center mb-8 relative">
            <h1 
              className="text-4xl font-display text-foreground tracking-wider"
              style={{ textShadow: `0 0 20px ${selectedSkin.glow}` }}
            >
              רביד מלאכי
            </h1>
            <p className="text-lg text-muted-foreground mt-1">RAVID MALACHI</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${selectedSkin.accentColor}20`,
                  color: selectedSkin.accentColor,
                  border: `1px solid ${selectedSkin.accentColor}50`
                }}
              >
                Point Guard
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm border border-blue-500/30">
                בני יהודה תל אביב
              </span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3 relative">
            {quickStats.map((stat, index) => (
              <div 
                key={stat.label}
                className="glass-card rounded-2xl p-4 text-center relative overflow-hidden group transition-all"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  borderColor: `${selectedSkin.accentColor}30`
                }}
              >
                {/* Stat Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(to top, ${selectedSkin.accentColor}10, transparent)` }}
                />
                <p 
                  className={`text-3xl sm:text-4xl font-display ${stat.color} relative`}
                  style={{ textShadow: index === 0 ? `0 0 20px ${selectedSkin.glow}` : undefined }}
                >
                  {stat.value}
                </p>
                <p className="text-base font-bold text-foreground mt-1 relative">{stat.label}</p>
                <p className="text-xs text-muted-foreground relative">{stat.labelHe}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customize Button (Mobile-friendly) */}
        <button 
          onClick={() => setIsSkinDialogOpen(true)}
          className="w-full stat-card rounded-2xl p-4 flex items-center justify-between glow-border transition-all hover:scale-[1.02] mb-6"
          style={{ borderColor: `${selectedSkin.accentColor}30` }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${selectedSkin.accentColor}, ${selectedSkin.accentColor}cc)`,
                boxShadow: `0 4px 20px ${selectedSkin.glow}`
              }}
            >
              <Palette className="text-white" size={26} />
            </div>
            <div className="text-right">
              <h3 className="font-display text-lg text-foreground">עיצוב אישי</h3>
              <p className="text-sm text-muted-foreground">בחר סקין לכרטיס</p>
            </div>
          </div>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${selectedSkin.accentColor}20` }}
          >
            <ChevronLeft style={{ color: selectedSkin.accentColor }} size={20} />
          </div>
        </button>

        {/* Shot Map */}
        <div className="mb-6">
          <ShotMap />
        </div>

        {/* Generate AI Avatar Button */}
        <button 
          onClick={handleGenerateAvatar}
          disabled={isGenerating}
          className="w-full stat-card rounded-2xl p-4 flex items-center justify-between glow-border transition-all hover:scale-[1.02] hover:border-primary/50 disabled:opacity-70 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl orange-gradient-bg flex items-center justify-center shadow-glow">
              <Sparkles className="text-primary-foreground" size={26} />
            </div>
            <div className="text-right">
              <h3 className="font-display text-lg text-foreground">
                {isGenerating ? "יוצר אווטאר..." : "צור אווטאר AI"}
              </h3>
              <p className="text-sm text-muted-foreground">Generate AI Avatar</p>
            </div>
          </div>
          {isGenerating ? (
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="text-primary" size={20} />
            </div>
          )}
        </button>

        {/* Achievements Row */}
        <div className="stat-card rounded-2xl p-4 mb-6">
          <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
            <Trophy className="text-primary" size={20} />
            הישגים
          </h3>
          <div className="flex justify-around">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  achievement.unlocked 
                    ? 'orange-gradient-bg shadow-glow' 
                    : 'bg-surface-elevated opacity-50'
                }`}>
                  <achievement.icon 
                    className={achievement.unlocked ? 'text-primary-foreground' : 'text-muted-foreground'} 
                    size={24} 
                  />
                </div>
                <span className="text-xs text-muted-foreground">{achievement.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Season Highlights */}
        <div className="stat-card rounded-2xl p-4">
          <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
            <Play className="text-primary" size={20} />
            הרגעים הגדולים של העונה
          </h3>
          
          <div className="space-y-3">
            {highlights.map((highlight, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl bg-surface-elevated/50 border border-border/50 transition-all hover:border-primary/30 hover:bg-surface-elevated group cursor-pointer"
              >
                {/* Video Thumbnail */}
                <div className="relative w-24 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-surface-dark flex items-center justify-center overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                    <Play className="text-primary-foreground ml-0.5" size={18} fill="currentColor" />
                  </div>
                  <span className="absolute bottom-1 right-1 text-xs text-white bg-black/70 px-1.5 py-0.5 rounded">
                    {highlight.duration}
                  </span>
                </div>
                
                {/* Video Info */}
                <div className="flex-1 text-right">
                  <h4 className="font-display text-foreground group-hover:text-primary transition-colors">
                    {highlight.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{highlight.titleEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Spacing for Nav */}
        <div className="h-8" />
      </div>

      {/* Skin Selection Dialog */}
      <Dialog open={isSkinDialogOpen} onOpenChange={setIsSkinDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">בחר סקין</DialogTitle>
          </DialogHeader>
          
          {/* Carousel Container */}
          <div className="relative py-4">
            {/* Navigation Arrows */}
            <button 
              onClick={() => scrollCarousel('right')}
              disabled={currentSkinIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-elevated/80 flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <ChevronRight size={24} className="text-foreground" />
            </button>
            <button 
              onClick={() => scrollCarousel('left')}
              disabled={currentSkinIndex === skins.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-elevated/80 flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <ChevronLeft size={24} className="text-foreground" />
            </button>

            {/* Carousel */}
            <div 
              ref={carouselRef}
              className="overflow-hidden mx-8"
            >
              <div 
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${currentSkinIndex * 100}%)` }}
              >
                {skins.map((skin) => (
                  <div 
                    key={skin.id}
                    className="w-full flex-shrink-0 px-2"
                  >
                    <button
                      onClick={() => handleSelectSkin(skin)}
                      disabled={skin.locked}
                      className={`w-full p-4 rounded-2xl transition-all relative overflow-hidden ${
                        selectedSkin.id === skin.id 
                          ? 'ring-2 ring-offset-2 ring-offset-background' 
                          : ''
                      } ${skin.locked ? 'opacity-60' : 'hover:scale-[1.02]'}`}
                      style={{ 
                        background: skin.gradient,
                        border: `2px solid ${skin.border}`,
                        boxShadow: selectedSkin.id === skin.id ? `0 0 20px ${skin.glow}` : undefined
                      }}
                    >
                      {/* Lock Overlay */}
                      {skin.locked && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                          <Lock className="text-white mb-2" size={32} />
                          <span className="text-xs text-white text-center px-4">{skin.unlockCondition}</span>
                        </div>
                      )}

                      {/* Selected Check */}
                      {selectedSkin.id === skin.id && !skin.locked && (
                        <div 
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: skin.accentColor }}
                        >
                          <Check className="text-white" size={14} />
                        </div>
                      )}

                      {/* Skin Preview */}
                      <div className="text-center py-4">
                        <div 
                          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-3"
                          style={{ 
                            background: `linear-gradient(135deg, ${skin.accentColor}40, ${skin.accentColor}20)`,
                            border: `2px solid ${skin.accentColor}`,
                            boxShadow: `0 0 20px ${skin.glow}`
                          }}
                        >
                          {skin.icon}
                        </div>
                        <h4 
                          className="font-display text-lg mb-1"
                          style={{ color: skin.accentColor }}
                        >
                          {skin.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{skin.nameEn}</p>
                        <p className="text-xs text-muted-foreground mt-2 px-4">{skin.description}</p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {skins.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSkinIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSkinIndex === index 
                      ? 'bg-primary w-6' 
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
