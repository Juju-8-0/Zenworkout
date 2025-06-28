import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import NotificationToast from "@/components/notification-toast";
import WorkoutModal, { WorkoutModalProvider } from "@/components/workout-modal";
import AIChat, { AIChatButton } from "@/components/ai-chat";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Routines from "@/pages/routines";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";



function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/routines" component={Routines} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WorkoutModalProvider>
            <AuthWrapper 
              showAIChat={showAIChat} 
              setShowAIChat={setShowAIChat} 
            />
          </WorkoutModalProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthWrapper({ showAIChat, setShowAIChat }: { 
  showAIChat: boolean; 
  setShowAIChat: (show: boolean) => void; 
}) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-zen-light dark:bg-zen-dark-mode transition-colors duration-300">
      {isAuthenticated && <Header />}
      <main className={isAuthenticated ? "max-w-md mx-auto px-4 py-6" : ""}>
        <Router />
      </main>
      {isAuthenticated && (
        <>
          <WorkoutModal />
          <AIChatWrapper 
            showAIChat={showAIChat} 
            setShowAIChat={setShowAIChat} 
          />
        </>
      )}
      <NotificationToast />
      <Toaster />
    </div>
  );
}

function AIChatWrapper({ showAIChat, setShowAIChat }: { 
  showAIChat: boolean; 
  setShowAIChat: (show: boolean) => void; 
}) {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"]
  });

  const isPro = settings?.isPro || false;

  return (
    <>
      <AIChatButton 
        onClick={() => setShowAIChat(true)} 
        isPro={isPro}
      />
      <AIChat 
        isOpen={showAIChat} 
        onClose={() => setShowAIChat(false)}
        isPro={isPro}
      />
    </>
  );
}

export default App;
