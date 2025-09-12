import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Phone, Camera, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

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

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex flex-col min-h-screen">
          <header className="p-4 border-b border-border bg-card">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                <div>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-muted rounded animate-pulse mt-1"></div>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 p-4">
            <div className="text-center text-muted-foreground">Loading conversation...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3 flex-1">
              <img 
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                alt="Chat participant" 
                className="w-10 h-10 rounded-full object-cover"
                data-testid="chat-avatar"
              />
              <div>
                <h3 className="font-medium" data-testid="chat-name">
                  User {otherUserId.slice(0, 8)}...
                </h3>
                <p className="text-xs text-green-500" data-testid="online-status">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" data-testid="call-button">
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto" data-testid="messages-container">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center" data-testid="no-messages">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isOwn = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`chat-bubble p-3 rounded-lg ${
                    isOwn ? "sent" : "received"
                  }`}
                  data-testid={`message-${msg.id}`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-xs mt-1 block ${
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" data-testid="camera-button">
              <Camera className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              data-testid="message-input"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              data-testid="send-button"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
