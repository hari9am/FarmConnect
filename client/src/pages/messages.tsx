import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";

export default function Messages() {
  const [, navigate] = useLocation();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: () => fetch("/api/conversations", { headers: getAuthHeaders() }).then(res => res.json()),
  });

  const handleConversationClick = (otherUserId: string) => {
    navigate(`/chat/${otherUserId}`);
  };

  const goBack = () => {
    const user = JSON.parse(localStorage.getItem("farmconnect-user") || "{}");
    if (user.role === "farmer") {
      navigate("/farmer/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  };

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
            <div className="flex-1">
              <h1 className="text-lg font-semibold" data-testid="page-title">Messages</h1>
              <p className="text-sm text-muted-foreground" data-testid="page-subtitle">
                Chat with farmers and customers
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Card data-testid="empty-conversations-state">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No conversations yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start chatting with farmers or customers to see your conversations here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation: any) => (
                <Card
                  key={conversation.other_user_id}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => handleConversationClick(conversation.other_user_id)}
                  data-testid={`conversation-${conversation.other_user_id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={conversation.role === "farmer" 
                          ? "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                          : "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                        }
                        alt={`${conversation.username} profile`}
                        className="w-12 h-12 rounded-full object-cover"
                        data-testid={`conversation-avatar-${conversation.other_user_id}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium" data-testid={`conversation-name-${conversation.other_user_id}`}>
                            {conversation.username}
                          </h3>
                          <span className="text-xs text-muted-foreground" data-testid={`conversation-time-${conversation.other_user_id}`}>
                            {new Date(conversation.last_message_time).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`conversation-preview-${conversation.other_user_id}`}>
                          {conversation.last_message || "No messages yet"}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {conversation.role === "farmer" ? "Farmer" : "Customer"}
                        </Badge>
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="text-right">
                          <Badge variant="destructive" data-testid={`unread-count-${conversation.other_user_id}`}>
                            {conversation.unread_count}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
