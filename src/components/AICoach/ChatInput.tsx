import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Video, X, Loader2, Upload, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatInputProps {
  onSend: (message: string, hasVideo: boolean, videoContext?: string, videoFile?: File) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [hasVideo, setHasVideo] = useState(false);
  const [videoContext, setVideoContext] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoType, setVideoType] = useState<"file" | "youtube" | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim(), hasVideo, videoContext, videoFile || undefined);
      setMessage("");
      setHasVideo(false);
      setVideoContext("");
      setVideoFile(null);
      setYoutubeUrl("");
      setVideoType(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVideoUpload = () => {
    fileInputRef.current?.click();
    setIsPopoverOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's a video file
      if (file.type.startsWith("video/")) {
        setVideoFile(file);
        setVideoContext(file.name);
        setHasVideo(true);
        setVideoType("file");
      } else {
        // Allow images too for demonstration
        setVideoFile(file);
        setVideoContext(file.name);
        setHasVideo(true);
        setVideoType("file");
      }
    }
    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  const handleYoutubeSubmit = () => {
    if (youtubeUrl.trim()) {
      // Basic YouTube URL validation
      const isValidYoutube = youtubeUrl.includes("youtube.com") || youtubeUrl.includes("youtu.be");
      if (isValidYoutube) {
        setVideoContext(`קישור YouTube: ${youtubeUrl}`);
        setHasVideo(true);
        setVideoType("youtube");
        setIsPopoverOpen(false);
      }
    }
  };

  const clearVideo = () => {
    setHasVideo(false);
    setVideoContext("");
    setVideoFile(null);
    setYoutubeUrl("");
    setVideoType(null);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-surface-dark/80 backdrop-blur-lg">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Video Preview */}
      {hasVideo && (
        <div className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-surface-dark flex items-center justify-center">
              {videoType === "youtube" ? (
                <Link className="text-primary" size={24} />
              ) : (
                <Video className="text-primary" size={24} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {videoType === "youtube" ? "קישור YouTube לניתוח" : "סרטון לניתוח"}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{videoContext}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearVideo}
          >
            <X size={18} />
          </Button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        {/* Video Options Button */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "flex-shrink-0 h-10 w-10",
                hasVideo && "text-primary bg-primary/10"
              )}
              disabled={isLoading}
            >
              <Video size={20} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" side="top" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">ניתוח וידאו 📹</h4>
              
              {/* Upload File Option */}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleVideoUpload}
              >
                <Upload size={18} />
                העלה סרטון מהמכשיר
              </Button>

              {/* YouTube Link Option */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="הדבק קישור YouTube..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="text-sm"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleYoutubeSubmit}
                    disabled={!youtubeUrl.trim()}
                  >
                    <Link size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  תומך בקישורים מ-YouTube
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Input */}
        <div className="flex-grow relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="כתוב הודעה למאמן..."
            className="min-h-[44px] max-h-[120px] resize-none pr-4 pl-12 py-3 bg-surface-elevated border-border/50 focus:border-primary/50"
            disabled={isLoading}
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
          disabled={!message.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        📹 לחץ על כפתור הוידאו כדי להעלות סרטון או להדביק קישור YouTube
      </p>
    </form>
  );
}
