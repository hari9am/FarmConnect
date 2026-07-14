import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Sprout } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { getAuthHeaders, getUserRole, isAuthenticated } from "@/lib/auth";

interface UpcomingParams {
  id: string;
}

function formatYield(t: (k: string) => string | undefined, u: any) {
  const yt = u?.yieldTime || {};
  const parts: string[] = [];
  if (yt.years) parts.push(`${yt.years} ${t("years") || "Years"}`);
  if (yt.months) parts.push(`${yt.months} ${t("months") || "Months"}`);
  if (yt.days) parts.push(`${yt.days} ${t("days") || "Days"}`);
  return parts.join(" ");
}

export default function UpcomingDetail() {
  const [, navigate] = useLocation();
  const { id } = useParams<UpcomingParams>();
  const { t } = useLanguage();

  const { data: item, isLoading } = useQuery({
    queryKey: ["/api/public/upcoming", id],
    queryFn: async () => {
      const res = await fetch(`/api/public/upcoming/${id}`);
      if (!res.ok) throw new Error("Failed to fetch upcoming crop");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: myFarmer, isLoading: loadingFarmer } = useQuery({
    queryKey: ["/api/farmer/profile"],
    queryFn: async () => {
      const res = await fetch("/api/farmer/profile", { headers: getAuthHeaders() });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch farmer profile");
      return res.json();
    },
    enabled: isAuthenticated() && getUserRole() === "farmer",
  });

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex flex-col min-h-screen">
          <div className="h-48 bg-muted animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-8 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mobile-container">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-xl font-semibold mb-2">{t("not_found") || "Not Found"}</h1>
          <p className="text-muted-foreground mb-4">{t("upcoming_not_found") || "The upcoming crop you're looking for doesn't exist."}</p>
          <Button onClick={() => navigate("/customer/dashboard")}>{t("back_to_dashboard") || "Back to Dashboard"}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="relative">
          <img
            src={item.photoUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&h=400"}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4">
            <Button
              variant="secondary"
              size="icon"
              className="bg-black/50 text-white hover:bg-black/70"
              onClick={() => navigate("/customer/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          {myFarmer && item?.farmerId && myFarmer.id === item.farmerId && (
            <div className="absolute top-4 right-4">
              <Button
                variant="secondary"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={() => navigate(`/farmer/edit-upcoming/${item.id}`)}
              >
                {t("edit") || "Edit"}
              </Button>
            </div>
          )}
        </header>

        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{item.name}</h1>
              <p className="text-sm text-muted-foreground">{t("upcoming_crops") || "Upcoming Crops"}</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {item.plantedDate ? (
                  <>
                    {t("planted_on") || "Planted on"}: {new Date(item.plantedDate).toLocaleDateString()}
                  </>
                ) : (
                  <>{t("planned") || "Planned"}</>
                )}
              </div>
              {item.yieldTime && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Sprout className="h-4 w-4 mr-2" />
                  {t("yield_in") || "Expected in"}: {formatYield(t, item)}
                </div>
              )}
              {item.location && typeof item.location.lat === "number" && typeof item.location.lng === "number" && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {item.location.lat.toFixed(5)}, {item.location.lng.toFixed(5)}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            {t("note_upcoming_not_for_sale") || "Note: This is a planned crop and not yet for sale."}
          </div>
        </div>
      </div>
    </div>
  );
}
