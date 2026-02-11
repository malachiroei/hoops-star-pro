import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasVideo?: boolean;
}

export function ChatMessage({ role, content, timestamp, hasVideo }: ChatMessageProps) {
  const isCoach = role === "assistant";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={cn("flex gap-3 mb-4", isCoach ? "flex-row" : "flex-row-reverse")}>
      {/* Avatar */}
      <Avatar className={cn("w-10 h-10 border-2 flex-shrink-0", isCoach ? "border-primary" : "border-muted")}>
        {isCoach ? (
          <>
            <AvatarImage src="/placeholder.svg" alt="Coach" />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              🏀
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-muted">
            <User size={18} />
          </AvatarFallback>
        )}
      </Avatar>

      {/* Message Bubble */}
      <div className={cn("max-w-[80%] space-y-1", isCoach ? "items-start" : "items-end")}>
        {/* Video indicator */}
        {hasVideo && (
          <div className="flex items-center gap-1 text-xs text-primary mb-1">
            <Video size={12} />
            <span>סרטון צורף</span>
          </div>
        )}
        
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
            isCoach
              ? "bg-gradient-to-br from-surface-elevated to-surface-dark border border-primary/20 rounded-tl-none"
              : "bg-gradient-to-br from-primary to-orange-600 text-primary-foreground rounded-tr-none"
          )}
        >
          {content}
        </div>

        {/* Timestamp */}
        <span className={cn("text-xs text-muted-foreground px-1", !isCoach && "text-left")}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
