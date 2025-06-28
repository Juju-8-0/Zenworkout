import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Sparkles, Heart, Bell, Clock } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useNotifications } from "@/hooks/use-notifications";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UpgradeModal from "@/components/upgrade-modal";
import { useState } from "react";
import type { UserSettings } from "@shared/schema";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { requestPermission } = useNotifications();
  const { toast } = useToast();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Settings updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    },
  });

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestPermission();
      if (permission !== "granted") {
        toast({ 
          title: "Permission Denied", 
          description: "Please enable notifications in your browser settings",
          variant: "destructive" 
        });
        return;
      }
    }
    handleSettingChange("notificationsEnabled", enabled);
  };

  const isPro = settings?.isPro || false;
  const proExpiresAt = settings?.proExpiresAt ? new Date(settings.proExpiresAt) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-zen-dark dark:text-white">Settings</h2>
          {isPro && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* ZenGym Pro Section */}
      {!isPro && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-zen-dark dark:text-white">Upgrade to ZenGym Pro</h3>
            <Badge variant="secondary" className="text-xs">Save $21/month</Badge>
          </div>
          <p className="text-sm text-zen-dark/70 dark:text-white/70 mb-4">
            Most fitness apps charge $29+ per month. Get premium features for just $7.99/month.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-zen-dark dark:text-white">Unlimited AI Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-zen-dark dark:text-white">Curated Meal Plans</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-zen-dark dark:text-white">Premium Routines</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-zen-dark dark:text-white">Calorie Tracker</span>
            </div>
          </div>
          <Button 
            onClick={() => setShowUpgrade(true)}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to ZenGym Pro
          </Button>
        </Card>
      )}

      {isPro && proExpiresAt && (
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-2 border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400">ZenGym Pro Active</h3>
          </div>
          <p className="text-sm text-green-600 dark:text-green-300">
            Your Pro subscription expires on {proExpiresAt.toLocaleDateString()}
          </p>
        </Card>
      )}

      {/* Workout Reminders */}
      <Card className="bg-white dark:bg-zen-gray rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zen-dark dark:text-white mb-4">Workout Reminders</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="workout-reminder" className="text-zen-dark dark:text-white">
              Daily Reminder
            </Label>
            <Switch
              id="workout-reminder"
              checked={settings?.workoutReminderEnabled ?? false}
              onCheckedChange={(checked) => handleSettingChange("workoutReminderEnabled", checked)}
            />
          </div>
          <div>
            <Label htmlFor="reminder-time" className="block text-sm font-medium text-zen-dark dark:text-white mb-2">
              Reminder Time
            </Label>
            <Input
              id="reminder-time"
              type="time"
              value={settings?.workoutReminderTime ?? "08:00"}
              onChange={(e) => handleSettingChange("workoutReminderTime", e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-zen-dark-mode text-zen-dark dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Affirmation Settings */}
      <Card className="bg-white dark:bg-zen-gray rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zen-dark dark:text-white mb-4">Daily Affirmations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="affirmation-enabled" className="text-zen-dark dark:text-white">
              Enable Affirmations
            </Label>
            <Switch
              id="affirmation-enabled"
              checked={settings?.affirmationEnabled ?? false}
              onCheckedChange={(checked) => handleSettingChange("affirmationEnabled", checked)}
            />
          </div>
          <div>
            <Label htmlFor="affirmation-time" className="block text-sm font-medium text-zen-dark dark:text-white mb-2">
              Affirmation Time
            </Label>
            <Input
              id="affirmation-time"
              type="time"
              value={settings?.affirmationTime ?? "07:00"}
              onChange={(e) => handleSettingChange("affirmationTime", e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-zen-dark-mode text-zen-dark dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* App Settings */}
      <Card className="bg-white dark:bg-zen-gray rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zen-dark dark:text-white mb-4">App Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-zen-dark dark:text-white">
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-zen-dark dark:text-white">
              Notifications
            </Label>
            <Switch
              id="notifications"
              checked={settings?.notificationsEnabled ?? false}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
        </div>
      </Card>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
      />

      <Link href="/">
        <Button className="w-full bg-gray-200 dark:bg-zen-dark-mode text-zen-dark dark:text-white font-medium py-3 px-6 rounded-xl">
          <ArrowLeft className="mr-2" size={16} />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
