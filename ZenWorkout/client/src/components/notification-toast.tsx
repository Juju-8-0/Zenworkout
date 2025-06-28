import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

interface NotificationData {
  title: string;
  message: string;
  type?: "workout" | "affirmation";
}

export default function NotificationToast() {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleNotification = (event: CustomEvent<NotificationData>) => {
      setNotification(event.detail);
      setIsVisible(true);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismissNotification();
      }, 5000);
    };

    window.addEventListener('showNotification', handleNotification as EventListener);
    
    return () => {
      window.removeEventListener('showNotification', handleNotification as EventListener);
    };
  }, []);

  const dismissNotification = () => {
    setIsVisible(false);
    setTimeout(() => {
      setNotification(null);
    }, 300);
  };

  if (!notification || !isVisible) return null;

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "workout":
        return "bg-zen-blue";
      case "affirmation":
        return "bg-zen-green";
      default:
        return "bg-zen-blue";
    }
  };

  return (
    <div className={`fixed top-20 left-4 right-4 z-50 max-w-md mx-auto transition-all duration-300 ${
      isVisible ? "transform translate-y-0 opacity-100" : "transform -translate-y-full opacity-0"
    }`}>
      <Card className={`${getBackgroundColor()} text-white rounded-xl p-4 shadow-lg flex items-center`}>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
          <Bell size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold">{notification.title}</h4>
          <p className="text-sm opacity-90">{notification.message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={dismissNotification}
          className="text-white/80 hover:text-white hover:bg-white/20 p-1 h-auto"
        >
          <X size={16} />
        </Button>
      </Card>
    </div>
  );
}

// Helper function to show notifications
export function showNotification(title: string, message: string, type?: "workout" | "affirmation") {
  const event = new CustomEvent('showNotification', {
    detail: { title, message, type }
  });
  window.dispatchEvent(event);
}
