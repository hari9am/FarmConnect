import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { getAuthHeaders } from "@/lib/auth";

export default function Messages() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: () => fetch("/api/conversations", { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        console.log("Conversations loaded:", data);
        return data;
      }),
  });

  if (error) {
    console.error("Failed to load conversations:", error);
  }

  const handleConversationClick = (otherUserId: string) => {
    navigate(`/chat/${otherUserId}`);
  };

  const goBack = () => {
    const user = JSON.parse(localStorage.getItem("farmconnect-user") || "{}");
    console.log("Messages goBack - user from localStorage:", user);
    console.log("Messages goBack - user.role:", user.role);
    console.log("Messages goBack - user.role type:", typeof user.role);
    
    if (user.role === "farmer") {
      console.log("Messages goBack - navigating to farmer dashboard");
      navigate("/farmer/dashboard");
    } else {
      console.log("Messages goBack - navigating to customer dashboard");
      navigate("/customer/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]"></div>
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 opacity-20 grain-noise"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Spatial Header */}
        <header className="glass-ultra p-4 fixed top-0 left-0 w-full z-50 h-20 flex items-center border-b border-white/10">
          <div className="flex items-center space-x-4 max-w-2xl mx-auto w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="hover:bg-white/10 transition-all rounded-full h-10 w-10 text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-black tracking-tighter text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {t("messages")}
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">
                {t("messages_subtitle")}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 pt-24 pb-12 px-4 max-w-2xl mx-auto w-full space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-1">
                  <div className="bg-slate-900/40 rounded-[1.1rem] p-4 flex items-center gap-4 animate-pulse">
                    <div className="w-14 h-14 bg-white/5 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-4 bg-white/5 rounded w-1/3"></div>
                       <div className="h-3 bg-white/5 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="glass-card p-1 animate-fade-up">
              <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[1.3rem] p-12 text-center border border-white/5">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t("no_conversations_yet")}</h3>
                <p className="text-slate-400 text-sm">{t("start_chatting")}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-up">
              {conversations
                .filter((c: any) => c?.last_message_time)
                .map((conversation: any, idx: number) => {
                  const dateStr = conversation.last_message_time
                    ? (() => {
                        const d = new Date(conversation.last_message_time);
                        return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
                      })()
                    : "";
                  return (
                    <div 
                      key={conversation.other_user_id} 
                      className="glass-card p-0.5 group cursor-pointer"
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => handleConversationClick(conversation.other_user_id)}
                    >
                      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[1.1rem] p-4 border border-white/5 flex items-center gap-4 transition-all group-hover:bg-white/5">
                        <div className="relative">
                          <img 
                            src={conversation.role === "farmer" 
                              ? "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                              : "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                            }
                            alt="Profile"
                            className="w-14 h-14 rounded-full object-cover border border-white/10"
                          />
                          {conversation.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-600 rounded-full border-2 border-slate-950 flex items-center justify-center">
                              <span className="text-[10px] font-black">{conversation.unread_count}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-white truncate">{conversation.username}</h3>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{dateStr}</span>
                          </div>
                          <p className="text-sm text-slate-400 truncate mb-2">
                            {conversation.last_message || t("no_messages_yet")}
                          </p>
                          <Badge className="bg-white/5 text-violet-400 border-white/10 text-[10px] font-bold px-2 py-0">
                            {conversation.role === "farmer" ? t("farmer_label") : t("customer_label")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
