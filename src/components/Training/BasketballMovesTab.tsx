import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Video, Upload, X, Plus, Edit2, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BasketballMove {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  videoUrl?: string;
  videoType?: "youtube" | "file";
  icon: string;
}

interface MoveVideo {
  move_id: string;
  video_url: string;
  video_type: string;
}

const initialMoves: BasketballMove[] = [
  {
    id: "crossover",
    name: "קרוסאובר",
    nameEn: "Crossover",
    description: "החלפת יד מהירה לחמיקה מהמגן",
    difficulty: "beginner",
    icon: "🔄",
  },
  {
    id: "eurostep",
    name: "יורו-סטאפ",
    nameEn: "Euro-Step",
    description: "שני צעדים בכיוונים מנוגדים סביב המגן",
    difficulty: "intermediate",
    icon: "👟",
  },
  {
    id: "stepback",
    name: "סטפ-בק",
    nameEn: "Step-Back",
    description: "צעד אחורה ליצירת מרחב לזריקה",
    difficulty: "intermediate",
    icon: "⬅️",
  },
  {
    id: "hesitation",
    name: "היזיטיישן",
    nameEn: "Hesitation",
    description: "עצירה מדומה להטעיית המגן",
    difficulty: "beginner",
    icon: "⏸️",
  },
  {
    id: "spin",
    name: "ספין מוב",
    nameEn: "Spin Move",
    description: "סיבוב מהיר עם הכדור סביב המגן",
    difficulty: "advanced",
    icon: "🌀",
  },
  {
    id: "between-legs",
    name: "כדרור בין הרגליים",
    nameEn: "Between the Legs",
    description: "העברת הכדור בין הרגליים לשינוי כיוון",
    difficulty: "intermediate",
    icon: "🦵",
  },
  {
    id: "behind-back",
    name: "כדרור מאחורי הגב",
    nameEn: "Behind the Back",
    description: "העברת הכדור מאחורי הגב",
    difficulty: "advanced",
    icon: "🔙",
  },
  {
    id: "floater",
    name: "פלואטר",
    nameEn: "Floater",
    description: "זריקה נמוכה מעל הגנה גבוהה",
    difficulty: "advanced",
    icon: "🎈",
  },
];

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

const difficultyLabels = {
  beginner: "מתחיל",
  intermediate: "בינוני",
  advanced: "מתקדם",
};

export function BasketballMovesTab() {
  const [moves, setMoves] = useState<BasketballMove[]>(initialMoves);
  const [selectedMove, setSelectedMove] = useState<BasketballMove | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved videos from database
  useEffect(() => {
    const loadSavedVideos = async () => {
      try {
        const { data, error } = await supabase
          .from("basketball_move_videos")
          .select("*");

        if (error) {
          console.error("Error loading videos:", error);
          return;
        }

        if (data && data.length > 0) {
          setMoves((prev) =>
            prev.map((move) => {
              const savedVideo = data.find((v: MoveVideo) => v.move_id === move.id);
              if (savedVideo) {
                return {
                  ...move,
                  videoUrl: savedVideo.video_url,
                  videoType: savedVideo.video_type as "youtube" | "file",
                };
              }
              return move;
            })
          );
        }
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedVideos();
  }, []);

  const extractYoutubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const saveVideoToDatabase = async (moveId: string, videoUrl: string, videoType: "youtube" | "file") => {
    try {
      const { error } = await supabase
        .from("basketball_move_videos")
        .upsert(
          { move_id: moveId, video_url: videoUrl, video_type: videoType },
          { onConflict: "move_id" }
        );

      if (error) throw error;
      toast.success("הסרטון נשמר בהצלחה!");
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error("שגיאה בשמירת הסרטון");
    }
  };

  const deleteVideoFromDatabase = async (moveId: string) => {
    try {
      const { error } = await supabase
        .from("basketball_move_videos")
        .delete()
        .eq("move_id", moveId);

      if (error) throw error;
      toast.success("הסרטון הוסר");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("שגיאה בהסרת הסרטון");
    }
  };

  const handleAddYoutubeVideo = async (moveId: string) => {
    if (!youtubeUrl.trim()) return;
    
    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      toast.error("קישור YouTube לא תקין");
      return;
    }

    setIsSaving(true);
    
    setMoves((prev) =>
      prev.map((move) =>
        move.id === moveId
          ? { ...move, videoUrl: youtubeUrl, videoType: "youtube" as const }
          : move
      )
    );
    
    await saveVideoToDatabase(moveId, youtubeUrl, "youtube");
    
    setYoutubeUrl("");
    setIsVideoDialogOpen(false);
    setSelectedMove(null);
    setIsSaving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, moveId: string) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setIsSaving(true);
      const objectUrl = URL.createObjectURL(file);
      
      // For local files, we save the filename as reference (won't persist across sessions for blob URLs)
      // In a production app, you'd upload to storage first
      setMoves((prev) =>
        prev.map((move) =>
          move.id === moveId
            ? { ...move, videoUrl: objectUrl, videoType: "file" as const }
            : move
        )
      );
      
      // Note: Blob URLs don't persist, so we save a placeholder message
      toast.info("סרטון מקומי נטען (לא יישמר לאחר רענון - השתמש ב-YouTube לשמירה קבועה)");
      setIsSaving(false);
    }
    e.target.value = "";
  };

  const handleRemoveVideo = async (moveId: string) => {
    setMoves((prev) =>
      prev.map((move) =>
        move.id === moveId
          ? { ...move, videoUrl: undefined, videoType: undefined }
          : move
      )
    );
    await deleteVideoFromDatabase(moveId);
  };

  const openVideoDialog = (move: BasketballMove) => {
    setSelectedMove(move);
    setIsVideoDialogOpen(true);
    setYoutubeUrl("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-card glow-border overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏀</span>
              <div>
                <h3 className="font-semibold">ספריית מהלכים</h3>
                <p className="text-xs text-muted-foreground">למד ותרגל מהלכים חדשים</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {moves.length} מהלכים
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Moves List */}
      <div className="space-y-3">
        {moves.map((move) => (
          <MoveCard
            key={move.id}
            move={move}
            onAddVideo={() => openVideoDialog(move)}
            onRemoveVideo={() => handleRemoveVideo(move.id)}
            extractYoutubeId={extractYoutubeId}
          />
        ))}
      </div>

      {/* Video Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="bg-surface-dark border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="text-primary" size={20} />
              הוסף סרטון ל{selectedMove?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => selectedMove && handleFileUpload(e, selectedMove.id)}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              העלה סרטון מהמכשיר
            </Button>

            {/* YouTube Link */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="הדבק קישור YouTube..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="text-sm bg-surface-elevated"
                  dir="ltr"
                />
                <Button
                  size="sm"
                  onClick={() => selectedMove && handleAddYoutubeVideo(selectedMove.id)}
                  disabled={!youtubeUrl.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Check size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                תומך בקישורים מ-YouTube
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MoveCardProps {
  move: BasketballMove;
  onAddVideo: () => void;
  onRemoveVideo: () => void;
  extractYoutubeId: (url: string) => string | null;
}

function MoveCard({ move, onAddVideo, onRemoveVideo, extractYoutubeId }: MoveCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const youtubeId = move.videoUrl && move.videoType === "youtube" 
    ? extractYoutubeId(move.videoUrl) 
    : null;

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:border-primary/30">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-surface-dark flex items-center justify-center text-2xl">
            {move.icon}
          </div>

          {/* Info */}
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{move.name}</h3>
              <Badge variant="outline" className={difficultyColors[move.difficulty]}>
                {difficultyLabels[move.difficulty]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{move.nameEn}</p>
          </div>

          {/* Action Button */}
          {move.videoUrl ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Play size={18} />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={onAddVideo}
            >
              <Plus size={16} className="ml-1" />
              הוסף סרטון
            </Button>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{move.description}</p>

        {/* Video Player */}
        {move.videoUrl && isExpanded && (
          <div className="space-y-2">
            <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-surface-dark">
              {move.videoType === "youtube" && youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={move.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <video
                  src={move.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </AspectRatio>
            
            {/* Video Actions */}
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={onAddVideo}
              >
                <Edit2 size={14} className="ml-1" />
                החלף סרטון
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onRemoveVideo}
              >
                <X size={14} className="ml-1" />
                הסר
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
