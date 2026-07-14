import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { ArrowLeft, Calendar, Home, Plus, PlusCircle, MessageCircle } from "lucide-react";

export default function FarmerActions() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/farmer/auth");
      return;
    }

    if (getUserRole() !== "farmer") {
      navigate("/role");
      return;
    }
  }, [navigate]);

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen pb-24 pt-16">
        <header className="p-2 bg-card border-b border-border fixed top-0 left-0 w-full z-40 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate("/farmer/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base font-semibold">{t("add_crop") || "Add Crop"}</h1>
                <p className="text-xs text-muted-foreground">{t("ready_to_sell") || "Ready to sell new crops?"}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-4">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2" data-testid="actions-add-crop-title">{t("ready_to_sell") || "Ready to sell new crops?"}</h3>
              <p className="text-primary-foreground/80 mb-4" data-testid="actions-add-crop-desc">{t("add_fresh_produce") || "Add your fresh produce to reach more customers"}</p>
              <Button
                onClick={() => navigate("/farmer/add-crop")}
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                data-testid="actions-add-crop-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("add_new_crop") || "Add New Crop"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2" data-testid="actions-add-upcoming-title">{t("plan_upcoming_crop") || "Plan an Upcoming Crop"}</h3>
              <p className="text-accent-foreground/80 mb-4" data-testid="actions-add-upcoming-desc">{t("plan_upcoming_crop_desc") || "Track what you're planting next and when it will be ready."}</p>
              <Button
                onClick={() => navigate("/farmer/add-upcoming-crop")}
                variant="secondary"
                className="bg-white text-accent hover:bg-white/90"
                data-testid="actions-add-upcoming-button"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t("add_upcoming_crop") || "Add Upcoming Crop"}
              </Button>
            </CardContent>
          </Card>

          <div className="pt-1">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/farmer/dashboard")}
              data-testid="actions-back-home"
            >
              <Home className="h-4 w-4 mr-2" />
              {t("home") || "Home"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
