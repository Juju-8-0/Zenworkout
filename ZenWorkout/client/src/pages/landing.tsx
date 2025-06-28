export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏋️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to ZenGym</h1>
          <p className="text-gray-600">Your personal fitness companion with AI coaching</p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary">✓</span>
            </div>
            <span className="text-sm text-gray-700">Track workouts and progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary">✓</span>
            </div>
            <span className="text-sm text-gray-700">Custom workout routines</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary">✓</span>
            </div>
            <span className="text-sm text-gray-700">AI fitness coach</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary">✓</span>
            </div>
            <span className="text-sm text-gray-700">Daily affirmations</span>
          </div>
        </div>

        <a 
          href="/api/login"
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity inline-block"
        >
          Sign in to get started
        </a>
        
        <p className="text-xs text-gray-500 mt-4">
          Secure authentication powered by Replit
        </p>
      </div>
    </div>
  );
}