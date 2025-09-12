import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LanguageSelection from "@/pages/language-selection";
import RoleSelection from "@/pages/role-selection";
import FarmerAuth from "@/pages/farmer-auth";
import CustomerAuth from "@/pages/customer-auth";
import FarmerDashboard from "@/pages/farmer-dashboard";
import AddCrop from "@/pages/add-crop";
import CustomerDashboard from "@/pages/customer-dashboard";
import ProductDetail from "@/pages/product-detail";
import Messages from "@/pages/messages";
import ChatDetail from "@/pages/chat-detail";
import Payment from "@/pages/payment";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LanguageSelection} />
      <Route path="/role" component={RoleSelection} />
      <Route path="/farmer/auth" component={FarmerAuth} />
      <Route path="/customer/auth" component={CustomerAuth} />
      <Route path="/farmer/dashboard" component={FarmerDashboard} />
      <Route path="/farmer/add-crop" component={AddCrop} />
      <Route path="/customer/dashboard" component={CustomerDashboard} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/messages" component={Messages} />
      <Route path="/chat/:userId" component={ChatDetail} />
      <Route path="/payment/:cropId" component={Payment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
