import { useEffect } from "react";

interface AchievementProps {
  title: string;
  description: string;
  xp: number;
  onClose: () => void;
}

export function Achievement({ title, description, xp, onClose }: AchievementProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right duration-500">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-lg max-w-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-secondary to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <i className="fas fa-trophy text-white text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">🎉 Achievement Unlocked!</h3>
          <p className="text-gray-700 mb-4"><strong>"{title}"</strong> - {description}</p>
          <div className="flex items-center justify-center space-x-2 text-secondary font-semibold">
            <i className="fas fa-star"></i>
            <span>+{xp} XP Earned!</span>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      </div>
    </div>
  );
}
