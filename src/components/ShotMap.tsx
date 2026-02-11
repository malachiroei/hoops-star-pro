import { useState } from "react";
import { Target, RefreshCw } from "lucide-react";

interface HeatZone {
  id: string;
  label: string;
  labelHe: string;
  percentage: number;
  attempts: number;
  position: { top: string; left: string };
  size: string;
}

const heatZones: HeatZone[] = [
  { id: "left-corner", label: "Left Corner 3", labelHe: "פינה שמאלית", percentage: 42, attempts: 38, position: { top: "75%", left: "8%" }, size: "w-14 h-14" },
  { id: "right-corner", label: "Right Corner 3", labelHe: "פינה ימנית", percentage: 48, attempts: 42, position: { top: "75%", left: "78%" }, size: "w-14 h-14" },
  { id: "left-wing", label: "Left Wing 3", labelHe: "כנף שמאלית", percentage: 35, attempts: 28, position: { top: "45%", left: "5%" }, size: "w-12 h-12" },
  { id: "right-wing", label: "Right Wing 3", labelHe: "כנף ימנית", percentage: 38, attempts: 31, position: { top: "45%", left: "82%" }, size: "w-12 h-12" },
  { id: "top-key", label: "Top of Key", labelHe: "ראש הרחבה", percentage: 45, attempts: 55, position: { top: "20%", left: "42%" }, size: "w-16 h-16" },
  { id: "paint", label: "In the Paint", labelHe: "בתוך הרחבה", percentage: 62, attempts: 89, position: { top: "55%", left: "42%" }, size: "w-20 h-20" },
  { id: "mid-left", label: "Mid-Range Left", labelHe: "טווח בינוני שמאל", percentage: 40, attempts: 20, position: { top: "50%", left: "20%" }, size: "w-11 h-11" },
  { id: "mid-right", label: "Mid-Range Right", labelHe: "טווח בינוני ימין", percentage: 44, attempts: 25, position: { top: "50%", left: "68%" }, size: "w-11 h-11" },
];

const getHeatColor = (percentage: number) => {
  if (percentage >= 50) return "bg-green-500/70 border-green-400";
  if (percentage >= 40) return "bg-yellow-500/60 border-yellow-400";
  if (percentage >= 30) return "bg-orange-500/60 border-orange-400";
  return "bg-red-500/60 border-red-400";
};

export function ShotMap() {
  const [selectedZone, setSelectedZone] = useState<HeatZone | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateMap = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 1500);
  };

  return (
    <div className="stat-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-foreground flex items-center gap-2">
          <Target className="text-primary" size={20} />
          מפת קליעות
        </h3>
        <span className="text-xs text-muted-foreground">Shot Map</span>
      </div>

      {/* Half Court */}
      <div className="relative aspect-[1/1] bg-gradient-to-b from-surface-elevated to-background rounded-2xl overflow-hidden border border-border/50">
        {/* Court Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Three Point Arc */}
          <path
            d="M 10 100 L 10 75 Q 10 25 50 15 Q 90 25 90 75 L 90 100"
            fill="none"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth="0.5"
          />
          {/* Free Throw Line */}
          <line x1="25" y1="60" x2="75" y2="60" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.5" />
          {/* Free Throw Circle */}
          <circle cx="50" cy="60" r="12" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.5" />
          {/* Paint */}
          <rect x="30" y="60" width="40" height="40" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.5" />
          {/* Basket */}
          <circle cx="50" cy="90" r="3" fill="none" stroke="hsl(var(--primary) / 0.5)" strokeWidth="0.5" />
          {/* Backboard */}
          <line x1="42" y1="95" x2="58" y2="95" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1" />
        </svg>

        {/* Heat Zones */}
        {heatZones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone)}
            className={`absolute rounded-full ${zone.size} ${getHeatColor(zone.percentage)} border-2 flex items-center justify-center transition-all hover:scale-110 hover:z-10`}
            style={{ 
              top: zone.position.top, 
              left: zone.position.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {zone.percentage}%
            </span>
          </button>
        ))}

        {/* Selected Zone Info Overlay */}
        {selectedZone && (
          <div 
            className="absolute bottom-2 left-2 right-2 glass-card rounded-xl p-3 animate-fade-in"
            onClick={() => setSelectedZone(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{selectedZone.labelHe}</p>
                <p className="text-xs text-muted-foreground">{selectedZone.label}</p>
              </div>
              <div className="text-left">
                <p className={`text-xl font-display ${selectedZone.percentage >= 40 ? 'text-green-400' : 'text-orange-400'}`}>
                  {selectedZone.percentage}%
                </p>
                <p className="text-xs text-muted-foreground">{selectedZone.attempts} ניסיונות</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Button */}
      <button
        onClick={handleUpdateMap}
        disabled={isUpdating}
        className="w-full mt-4 py-3 rounded-xl orange-gradient-bg text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-glow transition-all hover:scale-[1.02] disabled:opacity-70"
      >
        <RefreshCw className={`${isUpdating ? 'animate-spin' : ''}`} size={18} />
        {isUpdating ? "מעדכן..." : "עדכן מפת קליעות"}
      </button>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">50%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">40-49%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-muted-foreground">30-39%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">&lt;30%</span>
        </div>
      </div>
    </div>
  );
}
