// Local storage utilities for PWA functionality

interface LocalWorkoutData {
  routines: any[];
  sessions: any[];
  settings: any;
  lastSync: string;
}

const STORAGE_KEY = "zengym_data";

export function saveToLocalStorage(data: Partial<LocalWorkoutData>) {
  try {
    const existing = getFromLocalStorage();
    const updated = { ...existing, ...data, lastSync: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function getFromLocalStorage(): LocalWorkoutData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }
  
  return {
    routines: [],
    sessions: [],
    settings: {},
    lastSync: new Date().toISOString(),
  };
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

// PWA installation prompt
export function installPWA() {
  // This would be handled by the service worker and browser
  // For now, we'll just show instructions
  alert("To install ZenGym as an app:\n\n" +
        "Chrome/Edge: Click the install button in the address bar\n" +
        "Safari: Tap Share > Add to Home Screen\n" +
        "Firefox: Tap Menu > Install");
}
