import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { History } from "lucide-react";
import { useSmoothAutoScroll } from "@/hooks/useSmoothAutoScroll";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasVideo?: boolean;
  videoContext?: string;
}

interface SessionChatProps {
  sessionId: string;
  onSessionTitleUpdate: (title: string) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`;

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `היי רביד! 👋🏀

אני המאמן האישי שלך, וזמין בשבילך 24/7!

מה תרצה לדבר עליו היום?
• לדבר על משחק שהיה לך
• להעלות סרטון לניתוח טכני
• לקבל טיפים לאימון
• סתם לדבר על כדורסל

אני פה בשבילך! 🔥`,
  timestamp: new Date(),
};

export function SessionChat({ sessionId, onSessionTitleUpdate }: SessionChatProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Use the smooth auto-scroll hook
  const { 
    setScrollContainer, 
    triggerScroll, 
    scrollToBottomInstant,
    checkAndResumeAutoScroll 
  } = useSmoothAutoScroll({
    scrollSpeed: 12,
    bottomThreshold: 150,
    userScrollDebounce: 200,
  });

  // Set up scroll container when ref is available
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        setScrollContainer(viewport);
      }
    }
  }, [setScrollContainer]);

  // Load session messages
  useEffect(() => {
    const loadSessionMessages = async () => {
      setIsLoadingHistory(true);
      try {
        const { data, error } = await supabase
          .from("coach_chat_messages")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading session messages:", error);
          return;
        }

        if (data && data.length > 0) {
          const loadedMessages: Message[] = data.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
            hasVideo: msg.has_video || false,
            videoContext: msg.video_context || undefined,
          }));
          setMessages([WELCOME_MESSAGE, ...loadedMessages]);
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      } catch (error) {
        console.error("Failed to load session messages:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadSessionMessages();
  }, [sessionId]);

  // Scroll to bottom when messages change (instant for initial load)
  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottomInstant();
    }
  }, [isLoadingHistory, scrollToBottomInstant]);

  const generateSmartTitle = async (message: string, hasVideo: boolean, videoContext?: string): Promise<string> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-chat-title`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ message, hasVideo, videoContext }),
      });
 
      if (response.ok) {
        const data = await response.json();
        return data.title || message.substring(0, 30) + "...";
      }
    } catch (error) {
      console.error("Failed to generate title:", error);
    }
    return message.substring(0, 30) + (message.length > 30 ? "..." : "");
  };
 
  const saveMessage = async (message: Omit<Message, "id" | "timestamp">, isFirstMessage: boolean) => {
    try {
      // Generate title from first user message
      let sessionTitle = "שיחה חדשה";
      if (isFirstMessage && message.role === "user") {
        sessionTitle = await generateSmartTitle(message.content, message.hasVideo || false, message.videoContext);
        onSessionTitleUpdate(sessionTitle);
      }

      const { data, error } = await supabase
        .from("coach_chat_messages")
        .insert({
          session_id: sessionId,
          session_title: sessionTitle,
          role: message.role,
          content: message.content,
          has_video: message.hasVideo || false,
          video_context: message.videoContext || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving message:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Failed to save message:", error);
      return null;
    }
  };

  const handleSend = async (content: string, hasVideo: boolean, videoContext?: string, videoFile?: File) => {
    let finalContent = content;
    let finalVideoContext = videoContext;
    let videoBase64: string | undefined;
    let videoMimeType: string | undefined;

    if (hasVideo && videoFile) {
      finalVideoContext = `סרטון: ${videoFile.name}`;
      finalContent = `${content}\n\n[צורף קובץ לניתוח: ${videoFile.name}]`;
      
      // Convert file to base64 for AI analysis
      try {
        const arrayBuffer = await videoFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        videoBase64 = btoa(binary);
        videoMimeType = videoFile.type || 'image/jpeg';
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: finalContent,
      timestamp: new Date(),
      hasVideo,
      videoContext: finalVideoContext,
    };

    const isFirstUserMessage = messages.filter(m => m.role === "user").length === 0;
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    await saveMessage({
      role: "user",
      content: finalContent,
      hasVideo,
      videoContext: finalVideoContext,
    }, isFirstUserMessage);

    let assistantContent = "";

    try {
      const requestBody: Record<string, unknown> = {
        messages: [...messages.filter(m => m.id !== "welcome"), userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        hasVideo,
        videoContext: finalVideoContext,
      };
      
      // Include video data for AI analysis if available
      if (videoBase64 && videoMimeType) {
        requestBody.videoBase64 = videoBase64;
        requestBody.videoMimeType = videoMimeType;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "שגיאה בשירות");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
              // Smooth auto-scroll while streaming
              triggerScroll();
            }
          } catch {
            // Partial JSON, continue
          }
        }
      }

      if (assistantContent) {
        await saveMessage({
          role: "assistant",
          content: assistantContent,
        }, false);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("שגיאה בשליחת ההודעה, נסה שוב");
      setMessages((prev) => prev.filter((m) => m.content !== "" || m.role !== "assistant"));
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "היה לי משחק גרוע 😔", message: "היה לי משחק גרוע היום, לא הצלחתי כלום" },
    { label: "רוצה להשתפר בזריקות 🎯", message: "איך אני יכול להשתפר בזריקות משלוש?" },
    { label: "טיפים למשחק הבא 🔥", message: "תן לי טיפים למשחק הקרוב שלי" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Loading History Indicator */}
      {isLoadingHistory && (
        <div className="flex items-center justify-center gap-2 py-3 bg-surface-elevated/50 text-sm text-muted-foreground">
          <History size={16} className="animate-spin" />
          <span>טוען הודעות...</span>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            hasVideo={message.hasVideo}
          />
        ))}

        {isLoading && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg">
              🏀
            </div>
            <div className="px-4 py-3 rounded-2xl bg-surface-elevated border border-primary/20 rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - show only at start */}
        {messages.length === 1 && !isLoadingHistory && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-2">או בחר אחת מהאפשרויות:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="text-xs px-3 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                  onClick={() => handleSend(action.message, false)}
                  disabled={isLoading}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
