import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, RefreshCw, List, Settings, Flame, Crown, Sparkles } from "lucide-react";
import { useWorkoutModal } from "@/components/workout-modal";
import { getRandomAffirmation } from "@/lib/affirmations";
import UpgradeModal from "@/components/upgrade-modal";
import type { UserSettings } from "@shared/schema";

interface UserStats {
  totalWorkouts: number;
  weeklyWorkouts: number;
  streak: number;
}

interface WeeklyData {
  day: string;
  workouts: number;
  duration: number;
}

export default function Dashboard() {
  const [currentAffirmation, setCurrentAffirmation] = useState(getRandomAffirmation());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { openModal } = useWorkoutModal();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  const { data: weeklyData } = useQuery<WeeklyData[]>({
    queryKey: ["/api/user/weekly-data"],
  });

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/settings"]
  });

  const isPro = settings?.isPro || false;

  const handleNewAffirmation = () => {
    setCurrentAffirmation(getRandomAffirmation());
  };

  const getBarHeight = (workouts: number) => {
    if (workouts === 0) return "h-4";
    if (workouts === 1) return "h-8";
    if (workouts === 2) return "h-12";
    return "h-16";
  };

  const getBarColor = (workouts: number) => {
    return workouts > 0 ? "bg-zen-green" : "bg-gray-200 dark:bg-zen-dark-mode";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold text-zen-dark dark:text-white">
            Welcome to ZenGym
          </h1>
          {isPro && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
        <p className="text-zen-dark/70 dark:text-white/70">
          Your fitness journey starts here
        </p>
      </div>

      {/* ZenGym Pro Upgrade - Only show for free users */}
      {!isPro && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-bold text-zen-dark dark:text-white">Unlock ZenGym Pro</h3>
                <p className="text-sm text-zen-dark/70 dark:text-white/70">
                  Unlimited AI coaching, meal plans & premium content
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-xs mb-2">Save $21/mo</Badge>
              <Button 
                onClick={() => setShowUpgrade(true)}
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 block"
              >
                $7.99/mo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Welcome Section */}
      <Card className="bg-white dark:bg-zen-gray rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-zen-dark dark:text-white">Good Morning!</h2>
            <p className="text-gray-600 dark:text-gray-300">Ready for your workout?</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-zen-blue">{stats?.weeklyWorkouts || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">workouts this week</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zen-light dark:bg-zen-dark-mode rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-zen-green">{stats?.streak || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">day streak</div>
          </div>
          <div className="bg-zen-light dark:bg-zen-dark-mode rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-zen-orange">{stats?.totalWorkouts || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">total workouts</div>
          </div>
        </div>
      </Card>

      {/* Start Workout Section */}
      <Card className="gradient-zen-blue-green rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-2">Ready to Sweat?</h3>
            <p className="text-white/80 text-sm">Start your workout session</p>
          </div>
          <Flame className="text-2xl text-zen-orange" size={32} />
        </div>
        <Button 
          onClick={openModal}
          className="w-full bg-white text-zen-blue font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Play className="mr-2" size={16} />
          Start Workout
        </Button>
      </Card>

      {/* Affirmation of the Day */}
      <Card className="bg-white dark:bg-zen-gray rounded-2xl p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-zen-orange/20 rounded-full flex items-center justify-center mr-3">
            <Heart className="text-zen-orange" size={20} />
          </div>
          <h3 className="text-lg font-bold text-zen-dark dark:text-white">Daily Affirmation</h3>
        </div>
        <div className="gradient-zen-orange-green rounded-xl p-4">
          <p className="text-zen-dark dark:text-white font-medium italic">
            "{currentAffirmation}"
          </p>
        </div>
        <Button 
          variant="ghost"
          onClick={handleNewAffirmation}
          className="mt-3 text-zen-blue hover:text-zen-green transition-colors text-sm font-medium p-0 h-auto"
        >
          <RefreshCw className="mr-1" size={14} />
          Get New Affirmation
        </Button>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/routines">
          <Card className="bg-white dark:bg-zen-gray rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-zen-blue/20 rounded-full flex items-center justify-center mb-3 mx-auto">
              <List className="text-zen-blue text-xl" size={24} />
            </div>
            <h4 className="font-bold text-zen-dark dark:text-white">My Routines</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">View & edit</p>
          </Card>
        </Link>
        
        <Link href="/settings">
          <Card className="bg-white dark:bg-zen-gray rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-zen-green/20 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Settings className="text-zen-green text-xl" size={24} />
            </div>
            <h4 className="font-bold text-zen-dark dark:text-white">Settings</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Reminders & more</p>
          </Card>
        </Link>
      </div>

      {/* Weekly Progress */}
      <Card className="bg-white dark:bg-zen-gray rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zen-dark dark:text-white mb-4">This Week's Progress</h3>
        <div className="flex justify-between items-end space-x-2">
          {weeklyData?.map((day, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`${getBarColor(day.workouts)} ${getBarHeight(day.workouts)} w-full rounded-t-lg mb-2 transition-all-300`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
      />
    </div>
  );
}
