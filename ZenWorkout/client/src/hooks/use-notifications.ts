import { useState, useEffect } from "react";
import { showNotification } from "@/components/notification-toast";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } else {
      // Fallback to in-app notification
      showNotification(title, options?.body || "", "workout");
    }
  };

  const scheduleWorkoutReminder = (time: string) => {
    // In a real app, this would integrate with a service worker
    // For demo, we'll show a notification after a short delay
    setTimeout(() => {
      sendNotification("ZenGym Workout Reminder", {
        body: "Time for your daily workout! 💪",
        tag: "workout-reminder",
      });
    }, 10000); // 10 seconds for demo
  };

  const scheduleAffirmationReminder = (time: string) => {
    setTimeout(() => {
      sendNotification("Daily Affirmation", {
        body: "Here's your daily dose of motivation! ✨",
        tag: "affirmation-reminder",
      });
    }, 15000); // 15 seconds for demo
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleWorkoutReminder,
    scheduleAffirmationReminder,
  };
}
