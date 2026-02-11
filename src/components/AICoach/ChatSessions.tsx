import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Session {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
  messageCount: number;
}

interface ChatSessionsProps {
  onSelectSession: (sessionId: string | null) => void;
  currentSessionId: string | null;
}

export function ChatSessions({ onSelectSession, currentSessionId }: ChatSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = async () => {
    try {
      // Get all messages ordered by creation time (ascending to get first message title)
      const { data, error } = await supabase
        .from("coach_chat_messages")
        .select("session_id, session_title, content, created_at, role")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading sessions:", error);
        return;
      }

      if (data) {
        // Group by session_id - first message has the correct title
        const sessionMap = new Map<string, Session>();
        
        data.forEach((msg) => {
          if (!sessionMap.has(msg.session_id)) {
            // First message of session - use its title (generated from first user message)
            sessionMap.set(msg.session_id, {
              id: msg.session_id,
              title: msg.session_title || "שיחה חדשה",
              lastMessage: msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
              createdAt: new Date(msg.created_at),
              messageCount: 1,
            });
          } else {
            const session = sessionMap.get(msg.session_id)!;
            session.messageCount++;
            // Update title if this message has a better title (from first user message)
            if (msg.session_title && msg.session_title !== "שיחה חדשה") {
              session.title = msg.session_title;
            }
            // Update last message to be the most recent
            session.lastMessage = msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : "");
          }
        });

        // Sort sessions by most recent first
        const sortedSessions = Array.from(sessionMap.values()).sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        setSessions(sortedSessions);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const createNewSession = () => {
    const newSessionId = crypto.randomUUID();
    onSelectSession(newSessionId);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from("coach_chat_messages")
        .delete()
        .eq("session_id", sessionId);

      if (error) {
        toast.error("שגיאה במחיקת השיחה");
        return;
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        onSelectSession(null);
      }
      
      toast.success("השיחה נמחקה בהצלחה");
    } catch (error) {
      toast.error("שגיאה במחיקת השיחה");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={createNewSession}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus size={18} />
          שיחה חדשה
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-grow">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Clock size={18} className="animate-spin ml-2" />
              טוען שיחות...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">אין שיחות עדיין</p>
              <p className="text-xs mt-1">התחל שיחה חדשה עם המאמן</p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`p-3 cursor-pointer transition-all hover:bg-surface-elevated border-border ${
                  currentSessionId === session.id
                    ? "bg-primary/10 border-primary/30"
                    : "bg-surface-dark/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle size={14} className="text-primary shrink-0" />
                      <h4 className="font-medium text-sm truncate">{session.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{format(session.createdAt, "d בMMM", { locale: he })}</span>
                      <span>•</span>
                      <span>{session.messageCount} הודעות</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => deleteSession(session.id, e)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
