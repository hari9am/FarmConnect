import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, Star, MapPin, Phone, MessageCircle, ShoppingCart, Minus, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailParams {
  id: string;
}

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const { id } = useParams<ProductDetailParams>();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const { data: crop, isLoading } = useQuery({
    queryKey: ["/api/crops", id],
    queryFn: () => fetch(`/api/crops/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews/crop", id],
    queryFn: () => fetch(`/api/reviews/crop/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex flex-col min-h-screen">
          <div className="animate-pulse">
            <div className="h-64 bg-muted"></div>
            <div className="p-4 space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="mobile-container">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-xl font-semibold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/customer/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(crop.quantity, quantity + delta));
    setQuantity(newQuantity);
  };

  const handleBuyNow = () => {
    navigate(`/payment/${crop.id}?quantity=${quantity}`);
  };

  const handleContactFarmer = () => {
    navigate(`/chat/${crop.farmerId}`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Product removed from your favorites" : "Product added to your favorites",
    });
  };

  const totalPrice = (parseFloat(crop.pricePerUnit) * quantity).toFixed(2);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="relative">
          <img 
            src={crop.images?.[0] || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
            alt={crop.name}
            className="w-full h-64 object-cover"
            data-testid="product-image"
          />
          <div className="absolute top-4 left-4">
            <Button
              variant="secondary"
              size="icon"
              className="bg-black/50 text-white hover:bg-black/70"
              onClick={() => navigate("/customer/dashboard")}
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              size="icon"
              className="bg-black/50 text-white hover:bg-black/70"
              onClick={toggleFavorite}
              data-testid="favorite-button"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-6">
          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold" data-testid="product-name">{crop.name}</h1>
              <span className="text-2xl font-bold text-accent" data-testid="product-price">
                ₹{crop.pricePerUnit}/{crop.unit}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span data-testid="product-rating">{averageRating}</span>
                <span>({reviews.length} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span data-testid="product-distance">2.3 km away</span>
              </div>
            </div>
            {crop.description && (
              <p className="text-muted-foreground" data-testid="product-description">
                {crop.description}
              </p>
            )}
          </div>

          {/* Farmer Info */}
          <Card data-testid="farmer-info">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Farmer Details</h3>
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                  alt="Farmer profile" 
                  className="w-12 h-12 rounded-full object-cover"
                  data-testid="farmer-avatar"
                />
                <div className="flex-1">
                  <h4 className="font-medium" data-testid="farmer-name">Farmer {crop.farmerId.slice(0, 8)}...</h4>
                  <p className="text-sm text-muted-foreground" data-testid="farmer-location">Local Farm</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm" data-testid="farmer-rating">4.9</span>
                    <span className="text-xs text-muted-foreground">(127 reviews)</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContactFarmer}
                  data-testid="chat-farmer-button"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Availability */}
          <Card data-testid="quantity-selection">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Availability</h3>
                <Badge variant="secondary" data-testid="stock-status">
                  {crop.quantity} {crop.unit} available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      data-testid="decrease-quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center"
                      min="1"
                      max={crop.quantity}
                      data-testid="quantity-input"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= crop.quantity}
                      data-testid="increase-quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">{crop.unit}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold" data-testid="total-price">₹{totalPrice}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Reviews */}
          {reviews.length > 0 && (
            <div data-testid="reviews-section">
              <h3 className="font-semibold mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review: any) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-start space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                        alt="Customer profile" 
                        className="w-10 h-10 rounded-full object-cover"
                        data-testid={`review-avatar-${review.id}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm" data-testid={`review-customer-${review.id}`}>
                            Customer {review.customerId.slice(0, 8)}...
                          </span>
                          <div className="flex items-center space-x-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground" data-testid={`review-comment-${review.id}`}>
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border bg-card space-y-3">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleContactFarmer}
              data-testid="call-farmer-button"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Farmer
            </Button>
            <Button
              className="flex-1"
              onClick={handleBuyNow}
              data-testid="buy-now-button"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
