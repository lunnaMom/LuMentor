import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { LessonContent } from "@/components/LessonContent";
import { useProgress } from "@/hooks/useProgress";

export default function Home() {
  const { data: progress } = useProgress();
  const [currentModule, setCurrentModule] = useState(progress?.currentModule || 2);
  const [currentLesson, setCurrentLesson] = useState(progress?.currentLesson || 1);

  const handleModuleSelect = (moduleId: number) => {
    setCurrentModule(moduleId);
    setCurrentLesson(1);
  };

  const handleNextLesson = () => {
    // Simple navigation logic - in a real app, this would be more sophisticated
    setCurrentLesson(prev => prev + 1);
  };

  const handlePreviousLesson = () => {
    if (currentLesson > 1) {
      setCurrentLesson(prev => prev - 1);
    }
  };

  const canGoNext = currentLesson < 3; // Assuming 3 lessons per module max
  const canGoPrevious = currentLesson > 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar 
            currentModule={currentModule}
            onModuleSelect={handleModuleSelect}
          />
          
          <LessonContent
            moduleId={currentModule}
            lessonId={currentLesson}
            onNext={handleNextLesson}
            onPrevious={handlePreviousLesson}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
          />
        </div>
      </main>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
          <i className="fas fa-question text-xl"></i>
        </button>
      </div>
    </div>
  );
}
