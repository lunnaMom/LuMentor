import { useProgress } from "@/hooks/useProgress";
import { formatXP } from "@/lib/utils";

export function Header() {
  const { data: progress } = useProgress();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LuMentor</h1>
              <p className="text-xs text-gray-500">Java Game Dev Tutor</p>
            </div>
          </div>

          {/* Progress & User Info */}
          <div className="flex items-center space-x-6">
            {/* XP Counter */}
            <div className="flex items-center space-x-2 bg-accent/10 px-3 py-1 rounded-full">
              <i className="fas fa-star text-accent"></i>
              <span className="text-sm font-semibold text-gray-700">
                {progress ? formatXP(progress.xp) : '0'} XP
              </span>
            </div>
            
            {/* Streak Counter */}
            <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
              <i className="fas fa-fire text-orange-500"></i>
              <span className="text-sm font-semibold text-gray-700">
                {progress?.streak || 0} days
              </span>
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
