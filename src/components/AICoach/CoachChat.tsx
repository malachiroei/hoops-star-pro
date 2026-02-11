import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Menu } from "lucide-react";
import { ChatSessions } from "./ChatSessions";
import { SessionChat } from "./SessionChat";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface CoachChatProps {
  onBack: () => void;
}

export function CoachChat({ onBack }: CoachChatProps) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState("שיחה חדשה");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSelectSession = (sessionId: string | null) => {
    if (sessionId) {
      setCurrentSessionId(sessionId);
      setSessionTitle("שיחה חדשה");
    } else {
      setCurrentSessionId(null);
    }
    setIsSidebarOpen(false);
  };

  const handleNewSession = () => {
    const newSessionId = crypto.randomUUID();
    setCurrentSessionId(newSessionId);
    setSessionTitle("שיחה חדשה");
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-surface-dark/80 backdrop-blur-lg">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowRight size={20} />
        </Button>

        {/* Sidebar Toggle for Mobile */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="pt-12 h-full">
              <ChatSessions
                onSelectSession={handleSelectSession}
                currentSessionId={currentSessionId}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-2xl shadow-lg">
          🏀
        </div>

        <div className="flex-grow min-w-0">
          <h2 className="font-bold text-lg">המאמן האישי</h2>
          <p className="text-xs text-muted-foreground truncate">
            {currentSessionId ? sessionTitle : "בחר או התחל שיחה חדשה"}
          </p>
        </div>

        <Sparkles className="text-primary shrink-0" size={20} />
      </div>

      {/* Main Content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-[280px] border-l border-border bg-surface-dark/50">
          <ChatSessions
            onSelectSession={handleSelectSession}
            currentSessionId={currentSessionId}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-grow flex flex-col">
          {currentSessionId ? (
            <SessionChat
              sessionId={currentSessionId}
              onSessionTitleUpdate={setSessionTitle}
            />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-4xl mb-4 shadow-xl">
                🏀
              </div>
              <h3 className="text-xl font-bold mb-2">המאמן האישי שלך</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                בחר שיחה קיימת מהרשימה או התחל שיחה חדשה עם המאמן
              </p>
              <Button
                onClick={handleNewSession}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Sparkles size={18} />
                התחל שיחה חדשה
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
