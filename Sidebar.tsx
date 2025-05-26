import { useModules, useProgress } from "@/hooks/useProgress";
import { calculateOverallProgress, getModuleLockStatus, cn } from "@/lib/utils";
import { TOTAL_LESSONS } from "@/data/curriculum";

interface SidebarProps {
  currentModule: number;
  onModuleSelect: (moduleId: number) => void;
}

export function Sidebar({ currentModule, onModuleSelect }: SidebarProps) {
  const { data: modules } = useModules();
  const { data: progress } = useProgress();

  const overallProgress = progress ? 
    calculateOverallProgress(progress.completedLessons as Record<string, boolean>, TOTAL_LESSONS) : 0;

  return (
    <aside className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h2>
        
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Overall</span>
            <span className="text-sm font-semibold text-primary">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full progress-glow transition-all duration-500" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-3">
          {modules?.map((module: any) => {
            const isLocked = getModuleLockStatus(module.moduleId, progress?.completedModules || []);
            const isCompleted = progress?.completedModules?.includes(module.moduleId);
            const isCurrent = module.moduleId === currentModule;
            const completedLessons = Object.keys(progress?.completedLessons || {})
              .filter(key => key.startsWith(`${module.moduleId}-`)).length;

            return (
              <div
                key={module.moduleId}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-colors",
                  isLocked && "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200",
                  isCurrent && !isLocked && "bg-primary/5 border-primary/20 hover:bg-primary/10",
                  isCompleted && "bg-secondary/5 border-secondary/20 hover:bg-secondary/10",
                  !isCurrent && !isCompleted && !isLocked && "bg-white border-gray-200 hover:bg-gray-50"
                )}
                onClick={() => !isLocked && onModuleSelect(module.moduleId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      isLocked && "bg-gray-300",
                      isCompleted && "bg-secondary",
                      isCurrent && !isCompleted && "bg-primary",
                      !isCurrent && !isCompleted && !isLocked && "bg-gray-200"
                    )}>
                      {isLocked ? (
                        <i className="fas fa-lock text-gray-500 text-xs"></i>
                      ) : isCompleted ? (
                        <i className="fas fa-check text-white text-xs"></i>
                      ) : (
                        <span className="text-white text-xs font-bold">{module.moduleId}</span>
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      isLocked ? "text-gray-500" : "text-gray-900"
                    )}>
                      {module.moduleId}. {module.title}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xs font-semibold",
                    isLocked && "text-gray-400",
                    isCompleted && "text-secondary",
                    isCurrent && !isCompleted && "text-primary"
                  )}>
                    {completedLessons}/{module.lessonCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
