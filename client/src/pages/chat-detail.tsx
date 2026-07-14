import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Phone, Camera, Send, MessageCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

interface ChatDetailParams {
  userId: string;
}

export default function ChatDetail() {
  const [, navigate] = useLocation();
  const { userId: otherUserId } = useParams<ChatDetailParams>();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const currentUser = JSON.parse(localStorage.getItem("farmconnect-user") || "{}");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages", otherUserId],
    queryFn: () => fetch(`/api/messages/${otherUserId}`, { headers: getAuthHeaders() }).then(res => res.json()),
    enabled: !!otherUserId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        receiverId: otherUserId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time messages
  useWebSocket("/ws", {
    onMessage: (data) => {
      if (data.type === "new_message" && 
          (data.message.senderId === otherUserId || data.message.receiverId === otherUserId)) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const goBack = () => {
    navigate("/messages");
  };

  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative flex flex-col font-sans">
        <header className="glass-ultra p-4 fixed top-0 left-0 w-full z-50 h-20 flex items-center border-b border-border">
          <div className="flex items-center space-x-4 max-w-2xl mx-auto w-full animate-pulse">
            <div className="w-10 h-10 bg-primary/10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-primary/10 rounded w-1/3"></div>
              <div className="h-3 bg-primary/10 rounded w-1/4"></div>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs animate-pulse">{t("loading_conversation")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col font-sans overflow-hidden">
      {/* Background Flow */}
      <div className="farm-bg">
        <div className="farm-leaf" style={{ top: '-10%', left: '-10%' }} />
        <div className="farm-leaf" style={{ bottom: '-10%', right: '-10%', background: 'var(--accent)', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="glass-ultra p-4 h-20 flex items-center border-b border-border shrink-0">
          <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goBack}
                className="hover:bg-primary/10 transition-all rounded-full h-10 w-10 text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div>
                  <h3 className="font-bold text-foreground leading-none mb-1">
                    User {otherUserId.slice(0, 8)}
                  </h3>
                  <p className="text-[10px] font-black uppercase text-green-600 tracking-tighter">{t("online")}</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 rounded-full h-10 w-10 text-primary">
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-hide">
          <div className="max-w-2xl mx-auto w-full space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <MessageCircle className="w-12 h-12 mb-4 text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest leading-relaxed text-foreground">
                  {t("start_conversation_desc")}
                </p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const isOwn = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fade-up`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm relative transition-all hover:shadow-md ${
                      isOwn 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-white dark:bg-card text-foreground rounded-tl-none border border-border"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className={`text-[9px] font-bold uppercase mt-2 block opacity-70 ${isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Terminal */}
        <div className="p-4 border-t border-border glass-ultra shrink-0">
          <div className="max-w-2xl mx-auto flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="shrink-0 hover:bg-primary/10 rounded-full h-12 w-12 text-muted-foreground">
              <Camera className="h-6 w-6" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder={t("type_message")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-background border-border text-foreground rounded-2xl h-12 px-5 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
              />
            </div>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="shrink-0 h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-30 shadow-lg shadow-primary/10"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
