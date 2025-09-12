import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Shield, Smartphone, University, Banknote, Lock, Copy } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface PaymentParams {
  cropId: string;
}

interface PaymentFormProps {
  crop: any;
  quantity: number;
  totalAmount: number;
  clientSecret: string;
}

function PaymentForm({ crop, quantity, totalAmount, clientSecret }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/customer/dashboard",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Create order record
        await apiRequest("POST", "/api/orders", {
          cropId: crop.id,
          quantity,
          totalPrice: totalAmount,
          status: "completed",
        });

        toast({
          title: "Payment Successful!",
          description: "Your order has been placed successfully.",
        });
        navigate("/customer/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Payment Details</h3>
          <PaymentElement />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-primary mt-1" />
            <div className="text-sm">
              <p className="font-medium mb-1">Secure Transaction</p>
              <p className="text-muted-foreground">
                Your payment is processed securely. Money goes directly to the farmer's account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="pay-button"
      >
        <Lock className="h-4 w-4 mr-2" />
        {isProcessing ? "Processing..." : `Pay ₹${totalAmount} Securely`}
      </Button>
    </form>
  );
}

export default function Payment() {
  const [, navigate] = useLocation();
  const { cropId } = useParams<PaymentParams>();
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [upiPin, setUpiPin] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  // Get quantity from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const quantity = parseInt(urlParams.get("quantity") || "1");

  const { data: crop, isLoading } = useQuery({
    queryKey: ["/api/crops", cropId],
    queryFn: () => fetch(`/api/crops/${cropId}`).then(res => res.json()),
    enabled: !!cropId,
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", data);
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Unable to setup payment",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (crop && paymentMethod === "stripe") {
      const totalAmount = parseFloat(crop.pricePerUnit) * quantity + 20 + 10; // Add delivery and platform fees
      createPaymentIntentMutation.mutate({
        amount: totalAmount,
        cropId: crop.id,
        quantity,
      });
    }
  }, [crop, paymentMethod, quantity]);

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="mobile-container">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-xl font-semibold mb-2">Product Not Found</h1>
          <Button onClick={() => navigate("/customer/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(crop.pricePerUnit) * quantity;
  const deliveryFee = 20;
  const platformFee = 10;
  const totalAmount = subtotal + deliveryFee + platformFee;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("farmer.upi@example");
    toast({
      title: "UPI ID Copied",
      description: "The farmer's UPI ID has been copied to clipboard",
    });
  };

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/product/${cropId}`)}
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold" data-testid="page-title">Secure Payment</h1>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-6">
          {/* Order Summary */}
          <Card data-testid="order-summary">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src={crop.images?.[0] || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                  alt={crop.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  data-testid="order-product-image"
                />
                <div className="flex-1">
                  <h4 className="font-medium" data-testid="order-product-name">{crop.name}</h4>
                  <p className="text-sm text-muted-foreground" data-testid="order-farmer">
                    By Farmer {crop.farmerId.slice(0, 8)}...
                  </p>
                  <p className="text-sm" data-testid="order-quantity">
                    Quantity: {quantity} {crop.unit}
                  </p>
                </div>
                <span className="font-semibold text-lg" data-testid="order-subtotal">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span data-testid="subtotal-amount">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span data-testid="delivery-fee">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platform Fee</span>
                  <span data-testid="platform-fee">₹{platformFee}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                  <span>Total</span>
                  <span data-testid="total-amount">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card data-testid="payment-methods">
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex items-center space-x-3 flex-1 cursor-pointer">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium">Card Payment</span>
                      <p className="text-xs text-muted-foreground">Pay securely with your card</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center space-x-3 flex-1 cursor-pointer">
                    <University className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium">UPI Payment</span>
                      <p className="text-xs text-muted-foreground">Pay directly to farmer's UPI</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center space-x-3 flex-1 cursor-pointer">
                    <Banknote className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-xs text-muted-foreground">Pay when you receive</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Forms */}
          {paymentMethod === "stripe" && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                crop={crop}
                quantity={quantity}
                totalAmount={totalAmount}
                clientSecret={clientSecret}
              />
            </Elements>
          )}

          {paymentMethod === "upi" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Farmer's UPI ID</Label>
                    <div className="bg-muted p-3 rounded-lg flex items-center justify-between mt-2">
                      <span className="font-mono text-sm" data-testid="farmer-upi-id">
                        farmer.upi@example
                      </span>
                      <Button variant="ghost" size="sm" onClick={handleCopyUPI}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="upiPin" className="text-sm font-medium">Your UPI PIN</Label>
                    <Input
                      id="upiPin"
                      type="password"
                      placeholder="Enter 4-digit UPI PIN"
                      maxLength={4}
                      value={upiPin}
                      onChange={(e) => setUpiPin(e.target.value)}
                      className="text-center text-lg tracking-widest mt-2"
                      data-testid="upi-pin-input"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full" data-testid="pay-upi-button">
                <Lock className="h-4 w-4 mr-2" />
                Pay ₹{totalAmount.toFixed(2)} via UPI
              </Button>
            </div>
          )}

          {paymentMethod === "cod" && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-4">
                  <Banknote className="h-12 w-12 text-primary mx-auto" />
                  <div>
                    <h3 className="font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      You will pay ₹{totalAmount.toFixed(2)} when the order is delivered to you.
                    </p>
                  </div>
                  <Button className="w-full" data-testid="confirm-cod-button">
                    Confirm Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
