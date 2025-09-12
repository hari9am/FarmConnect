import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Home, PlusCircle, User, Sprout, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";

export default function FarmerDashboard() {
  const [, navigate] = useLocation();
  const [unreadCount] = useState(3); // This would come from WebSocket in real app

  const { data: crops = [], isLoading } = useQuery({
    queryKey: ["/api/farmer/crops"],
    queryFn: () => fetch("/api/farmer/crops", { headers: getAuthHeaders() }).then(res => res.json()),
  });

  const user = JSON.parse(localStorage.getItem("farmconnect-user") || "{}");

  const stats = {
    activeCrops: crops.length,
    monthlyEarnings: 12500, // This would be calculated from actual orders
  };

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold" data-testid="welcome-message">
                Good morning, {user.username}!
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="dashboard-subtitle">Manage your crops</p>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                data-testid="messages-button"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="notification-badge" data-testid="message-badge">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card data-testid="active-crops-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="active-crops-count">{stats.activeCrops}</p>
                    <p className="text-sm text-muted-foreground">Active Crops</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="monthly-earnings-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="monthly-earnings">₹{stats.monthlyEarnings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add New Crop CTA */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2" data-testid="add-crop-title">Ready to sell new crops?</h3>
              <p className="text-primary-foreground/80 mb-4" data-testid="add-crop-description">
                Add your fresh produce to reach more customers
              </p>
              <Button
                onClick={() => navigate("/farmer/add-crop")}
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                data-testid="add-crop-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Crop
              </Button>
            </CardContent>
          </Card>

          {/* My Crops */}
          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="my-crops-title">My Crops</h3>
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
            ) : crops.length === 0 ? (
              <Card data-testid="empty-crops-state">
                <CardContent className="p-6 text-center">
                  <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No crops added yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start by adding your first crop to connect with customers</p>
                  <Button onClick={() => navigate("/farmer/add-crop")} data-testid="add-first-crop">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Crop
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {crops.map((crop: any) => (
                  <Card key={crop.id} data-testid={`crop-card-${crop.id}`}>
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
                          <p className="text-sm text-muted-foreground" data-testid={`crop-quantity-${crop.id}`}>
                            {crop.quantity} {crop.unit} available
                          </p>
                          <p className="text-accent font-semibold" data-testid={`crop-price-${crop.id}`}>
                            ₹{crop.pricePerUnit}/{crop.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={crop.isActive ? "default" : "secondary"} data-testid={`crop-status-${crop.id}`}>
                            {crop.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {crop.expiryDate && (
                            <p className="text-xs text-muted-foreground mt-1" data-testid={`crop-expiry-${crop.id}`}>
                              {Math.ceil((new Date(crop.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                            </p>
                          )}
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
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-primary" data-testid="nav-home">
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center space-y-1 text-muted-foreground"
              onClick={() => navigate("/farmer/add-crop")}
              data-testid="nav-add-crop"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="text-xs">Add Crop</span>
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
