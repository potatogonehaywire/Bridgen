import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";
import Features from "@/pages/features";
import Gamification from "@/pages/gamification";
import TrackingDevices from "@/pages/tracking-devices";
import NotFound from "@/pages/not-found";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/chat" component={Chat} />
      <Route path="/features" component={Features} />
      <Route path="/gamification" component={Gamification} />
      <Route path="/tracking-devices" component={TrackingDevices} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
