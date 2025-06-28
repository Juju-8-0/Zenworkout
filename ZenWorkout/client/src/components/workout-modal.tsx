import { useState, useEffect, createContext, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Play, Pause, Square, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkoutModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const WorkoutModalContext = createContext<WorkoutModalContextType | undefined>(undefined);

export function WorkoutModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <WorkoutModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </WorkoutModalContext.Provider>
  );
}

export function useWorkoutModal() {
  const context = useContext(WorkoutModalContext);
  if (!context) {
    throw new Error("useWorkoutModal must be used within WorkoutModalProvider");
  }
  return context;
}

export default function WorkoutModal() {
  const { isOpen, closeModal } = useWorkoutModal();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (duration: number) => {
      const response = await apiRequest("POST", "/api/sessions", {
        duration: Math.floor(duration / 60),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/weekly-data"] });
      toast({ title: "Workout Complete!", description: "Great job! Your workout session has been logged." });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds]);

  // Emit focus mode events
  useEffect(() => {
    const event = new CustomEvent('focusModeChange', { 
      detail: { active: isOpen && isActive } 
    });
    window.dispatchEvent(event);
  }, [isOpen, isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (seconds > 0) {
      createSessionMutation.mutate(seconds);
    }
    setIsActive(false);
    setIsRunning(false);
    setSeconds(0);
    closeModal();
  };

  const handleClose = () => {
    if (isRunning) {
      handlePause();
    }
    if (!isActive) {
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="w-16 h-16 bg-zen-blue/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Dumbbell className="text-zen-blue text-2xl" size={32} />
            </div>
            <h3 className="text-xl font-bold text-zen-dark dark:text-white mb-2">
              {isActive ? "Workout in Progress" : "Starting Workout Session"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-normal">
              {isActive 
                ? "Keep going! You're doing great!" 
                : "Focus mode will be activated to minimize distractions"
              }
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-zen-light dark:bg-zen-dark-mode rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-zen-dark dark:text-white">Session Timer</span>
              <span className="text-xl font-bold text-zen-blue">{formatTime(seconds)}</span>
            </div>
            <Progress 
              value={isActive ? 100 : 0} 
              className="w-full h-2"
            />
          </div>

          <div className="flex space-x-3">
            {!isRunning ? (
              <Button 
                onClick={handleStart}
                className="flex-1 bg-zen-green text-white font-bold py-3 px-6 rounded-xl hover:bg-zen-green/90"
              >
                <Play className="mr-2" size={16} />
                {isActive ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button 
                onClick={handlePause}
                className="flex-1 bg-zen-orange text-white font-bold py-3 px-6 rounded-xl hover:bg-zen-orange/90"
              >
                <Pause className="mr-2" size={16} />
                Pause
              </Button>
            )}
            <Button 
              onClick={handleStop}
              className="flex-1 bg-gray-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-600"
              disabled={!isActive}
            >
              <Square className="mr-2" size={16} />
              Stop
            </Button>
          </div>
          
          <Button 
            onClick={handleClose}
            variant="outline"
            className="w-full font-medium py-3 px-6 rounded-xl"
          >
            <X className="mr-2" size={16} />
            {isActive ? "Minimize" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
