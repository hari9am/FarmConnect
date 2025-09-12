import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageCircle, ShoppingCart, MapPin, Star, Map, Heart, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/use-geolocation";

export default function CustomerDashboard() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("nearby");
  const [unreadCount] = useState(2);
  const { getCurrentPosition } = useGeolocation();

  const user = JSON.parse(localStorage.getItem("farmconnect-user") || "{}");

  const { data: crops = [], isLoading } = useQuery({
    queryKey: ["/api/crops"],
    queryFn: () => fetch("/api/crops").then(res => res.json()),
  });

  const filteredCrops = crops.filter((crop: any) =>
    crop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filters = [
    { id: "nearby", label: "Nearby", icon: MapPin },
    { id: "vegetables", label: "Vegetables", icon: "🥬" },
    { id: "fruits", label: "Fruits", icon: "🍎" },
    { id: "grains", label: "Grains", icon: "🌾" },
  ];

  const handleProductClick = (cropId: string) => {
    navigate(`/product/${cropId}`);
  };

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="p-4 bg-card border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold" data-testid="welcome-message">
                Hi {user.username}!
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="dashboard-subtitle">
                Find fresh produce near you
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                className="relative"
                data-testid="messages-button"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="notification-badge" data-testid="message-badge">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" data-testid="cart-button">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for vegetables, fruits..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
            />
          </div>
        </header>

        <div className="flex-1">
          {/* Filter Tabs */}
          <div className="p-4 border-b border-border">
            <div className="flex space-x-4 overflow-x-auto">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "secondary"}
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => setSelectedFilter(filter.id)}
                  data-testid={`filter-${filter.id}`}
                >
                  {typeof filter.icon === "string" ? (
                    <span className="mr-2">{filter.icon}</span>
                  ) : (
                    <filter.icon className="h-4 w-4 mr-2" />
                  )}
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Map View */}
          <div className="map-container relative" data-testid="map-container">
            {/* Simulated product pins */}
            {filteredCrops.slice(0, 3).map((crop: any, index: number) => {
              const positions = [
                { top: "30%", left: "25%" },
                { top: "60%", left: "60%" },
                { top: "45%", left: "75%" },
              ];
              
              return (
                <div
                  key={crop.id}
                  className="product-pin"
                  style={positions[index]}
                  onClick={() => handleProductClick(crop.id)}
                  data-testid={`map-pin-${crop.id}`}
                >
                  <img
                    src={crop.images?.[0] || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                    alt={crop.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              );
            })}

            {/* Map controls */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md">
              <Button variant="ghost" size="icon" data-testid="locate-me-button">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Recently Added */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4" data-testid="recently-added-title">Recently Added</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded mb-1 w-2/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCrops.length === 0 ? (
              <Card data-testid="empty-crops-state">
                <CardContent className="p-6 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No crops found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredCrops.map((crop: any) => (
                  <Card
                    key={crop.id}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleProductClick(crop.id)}
                    data-testid={`crop-card-${crop.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={crop.images?.[0] || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                          alt={crop.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          data-testid={`crop-image-${crop.id}`}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium" data-testid={`crop-name-${crop.id}`}>{crop.name}</h4>
                          <p className="text-sm text-muted-foreground" data-testid={`crop-farmer-${crop.id}`}>
                            By Farmer {crop.farmerId.slice(0, 8)}...
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-accent font-semibold" data-testid={`crop-price-${crop.id}`}>
                              ₹{crop.pricePerUnit}/{crop.unit}
                            </span>
                            <span className="text-xs text-muted-foreground" data-testid={`crop-distance-${crop.id}`}>
                              2.3 km away
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-yellow-500 mb-1">
                            <Star className="h-3 w-3" />
                            <span className="text-xs" data-testid={`crop-rating-${crop.id}`}>4.8</span>
                          </div>
                          <Badge variant="secondary" data-testid={`crop-status-${crop.id}`}>Available</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="bg-card border-t border-border p-4" data-testid="bottom-navigation">
          <div className="flex justify-around">
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-primary" data-testid="nav-explore">
              <Map className="h-5 w-5" />
              <span className="text-xs">Explore</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-muted-foreground" data-testid="nav-favorites">
              <Heart className="h-5 w-5" />
              <span className="text-xs">Favorites</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center space-y-1 text-muted-foreground relative"
              onClick={() => navigate("/messages")}
              data-testid="nav-messages"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">Messages</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Button>
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-muted-foreground" data-testid="nav-profile">
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
