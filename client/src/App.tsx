import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import LanguageSelection from "@/pages/language-selection";
import RoleSelection from "@/pages/role-selection";
import FarmerAuth from "@/pages/farmer-auth";
import CustomerAuth from "@/pages/customer-auth";
import FarmerDashboard from "@/pages/farmer-dashboard";
import FarmerActivity from "@/pages/farmer-activity";
import FarmerActions from "@/pages/farmer-actions";
import AddCrop from "@/pages/add-crop";
import AddUpcomingCrop from "@/pages/add-upcoming-crop";
import EditUpcomingCrop from "@/pages/edit-upcoming-crop";
import CustomerDashboard from "@/pages/customer-dashboard";
import ProductDetail from "@/pages/product-detail";
import EditCrop from "@/pages/edit-crop";
import UpcomingDetail from "@/pages/upcoming-detail";
import Messages from "@/pages/messages";
import ChatDetail from "@/pages/chat-detail";
import Payment from "@/pages/payment";
import CartPage from "@/pages/cart";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import RewardsPage from "@/pages/rewards";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LanguageSelection} />
      <Route path="/role" component={RoleSelection} />
      <Route path="/farmer/auth" component={FarmerAuth} />
      <Route path="/customer/auth" component={CustomerAuth} />
      <Route path="/farmer/dashboard" component={FarmerDashboard} />
      <Route path="/farmer/activity" component={FarmerActivity} />
      <Route path="/farmer/actions" component={FarmerActions} />
      <Route path="/farmer/add-crop" component={AddCrop} />
      <Route path="/farmer/add-upcoming-crop" component={AddUpcomingCrop} />
      <Route path="/farmer/edit-upcoming/:id" component={EditUpcomingCrop} />
      <Route path="/farmer/edit-crop/:id" component={EditCrop} />
      <Route path="/customer/dashboard" component={CustomerDashboard} />
      <Route path="/upcoming/:id" component={UpcomingDetail} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/messages" component={Messages} />
      <Route path="/chat/:userId" component={ChatDetail} />
      <Route path="/payment/:cropId" component={Payment} />
      <Route path="/profile" component={Profile} />
      <Route path="/rewards" component={RewardsPage} />
      <Route path="/cart" component={CartPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { NatureCursor } from "@/components/NatureCursor";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <NatureCursor />
          <Router />
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
