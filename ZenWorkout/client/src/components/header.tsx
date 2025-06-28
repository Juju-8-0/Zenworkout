import { Dumbbell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useState, useEffect } from "react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const handleFocusModeChange = (event: CustomEvent) => {
      setFocusMode(event.detail.active);
    };

    window.addEventListener('focusModeChange', handleFocusModeChange as EventListener);
    
    return () => {
      window.removeEventListener('focusModeChange', handleFocusModeChange as EventListener);
    };
  }, []);

  return (
    <header className="gradient-zen-blue-green text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Dumbbell className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold">ZenGym</h1>
        </div>
        <div className="flex items-center space-x-3">
          {/* Focus Mode Indicator */}
          {focusMode && (
            <div className="bg-zen-orange/20 px-3 py-1 rounded-full focus-mode-pulse">
              <span className="text-xs font-medium">🧘 Focus Mode</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center p-0 hover:bg-white/30"
          >
            {theme === "dark" ? (
              <Sun className="text-white" size={16} />
            ) : (
              <Moon className="text-white" size={16} />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
