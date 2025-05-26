import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateOverallProgress(completedLessons: Record<string, boolean>, totalLessons: number): number {
  const completed = Object.keys(completedLessons).length;
  return Math.round((completed / totalLessons) * 100);
}

export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

export function getModuleLockStatus(moduleId: number, completedModules: number[]): boolean {
  if (moduleId === 1) return false; // First module is always unlocked
  return !completedModules.includes(moduleId - 1);
}

export function getLessonKey(moduleId: number, lessonId: number): string {
  return `${moduleId}-${lessonId}`;
}

export function getAchievementTitle(type: string, moduleId?: number): string {
  switch (type) {
    case 'quiz_master':
      return 'Quiz Master';
    case 'module_complete':
      return `Module ${moduleId} Complete`;
    case 'canvas_master':
      return 'Canvas Master';
    case 'code_warrior':
      return 'Code Warrior';
    default:
      return 'Achievement Unlocked';
  }
}

export function getAchievementDescription(type: string, moduleId?: number): string {
  switch (type) {
    case 'quiz_master':
      return 'Perfect score on a quiz!';
    case 'module_complete':
      return `You completed all lessons in Module ${moduleId}!`;
    case 'canvas_master':
      return 'You learned how to use Canvas to draw!';
    case 'code_warrior':
      return 'You successfully completed a coding task!';
    default:
      return 'Great job on your learning journey!';
  }
}
