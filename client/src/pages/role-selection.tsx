import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RoleSelection() {
  const [, navigate] = useLocation();

  return (
    <div className="mobile-container">
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold mb-2" data-testid="welcome-title">Welcome to FarmConnect</h1>
          <p className="text-muted-foreground" data-testid="role-prompt">Choose your role to continue</p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <Button
            onClick={() => navigate("/farmer/auth")}
            variant="outline"
            className="w-full h-auto p-6 hover:bg-accent hover:text-accent-foreground transition-colors"
            data-testid="role-farmer"
          >
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                alt="Farmer working in agricultural field" 
                className="w-20 h-20 mx-auto rounded-full mb-4 object-cover border-2 border-primary/20"
              />
              <h3 className="text-lg font-semibold mb-2">I'm a Farmer</h3>
              <p className="text-sm text-muted-foreground">Sell your crops directly to customers</p>
            </div>
          </Button>

          <Button
            onClick={() => navigate("/customer/auth")}
            variant="outline"
            className="w-full h-auto p-6 hover:bg-accent hover:text-accent-foreground transition-colors"
            data-testid="role-customer"
          >
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                alt="Fresh vegetables and fruits at farmers market" 
                className="w-20 h-20 mx-auto rounded-full mb-4 object-cover border-2 border-accent/20"
              />
              <h3 className="text-lg font-semibold mb-2">I'm a Customer</h3>
              <p className="text-sm text-muted-foreground">Buy fresh produce from local farmers</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
