import { useLesson } from "@/hooks/useProgress";
import { CodeEditor } from "./CodeEditor";
import { Quiz } from "./Quiz";
import { Achievement } from "./Achievement";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LessonContentProps {
  moduleId: number;
  lessonId: number;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function LessonContent({ 
  moduleId, 
  lessonId, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious 
}: LessonContentProps) {
  const { data: lesson, isLoading } = useLesson(moduleId, lessonId);
  const [showAchievement, setShowAchievement] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (isLoading) {
    return (
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Lesson not found</p>
        </div>
      </div>
    );
  }

  const content = lesson.content as any;
  const lessonProgress = ((taskCompleted ? 1 : 0) + (quizCompleted ? 1 : 0)) / 2 * 100;

  const handleTaskComplete = () => {
    setTaskCompleted(true);
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 3000);
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  return (
    <div className="lg:col-span-3">
      {/* Lesson Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-emerald-600 rounded-xl flex items-center justify-center animate-float">
              <i className="fas fa-mobile-alt text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-600">
                Module {moduleId}: {lesson.description} • Lesson {lessonId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <i className="fas fa-clock text-gray-400"></i>
              <span className="text-sm text-gray-600">~{lesson.duration} min</span>
            </div>
          </div>
        </div>
        
        {/* Lesson Progress */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Lesson Progress</span>
          <span className="text-sm font-semibold text-secondary">{Math.round(lessonProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-secondary to-emerald-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${lessonProgress}%` }}
          ></div>
        </div>
      </div>

      {/* LuMentor Introduction */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-slow">
            <i className="fas fa-robot text-white text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hi there! I'm LuMentor 🤖</h3>
            <p className="text-gray-700 leading-relaxed">
              {content.theory}
            </p>
          </div>
        </div>
      </div>

      {/* Theory Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <i className="fas fa-book text-blue-600"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">📚 Understanding the Concept</h2>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-4">{content.theory}</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <i className="fas fa-lightbulb text-yellow-600"></i>
              <span className="font-semibold text-yellow-800">Remember!</span>
            </div>
            <p className="text-yellow-800">
              Practice makes perfect! Don't worry if it seems tricky at first - every expert was once a beginner! 🌟
            </p>
          </div>
        </div>
      </div>

      {/* Code Example Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <i className="fas fa-code text-green-600"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">💻 Let's See Some Code!</h2>
        </div>
        
        <p className="text-gray-700 mb-4">
          Here's an example to help you understand. Don't worry if it looks complex - we'll break it down! 🧩
        </p>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Example.java</span>
          </div>
          <pre className="font-mono text-sm text-gray-800 overflow-x-auto">
            <code>{content.codeExample}</code>
          </pre>
        </div>
      </div>

      {/* Interactive Coding Task */}
      <CodeEditor 
        task={content.task}
        moduleId={moduleId}
        lessonId={lessonId}
        onComplete={handleTaskComplete}
      />

      {/* Quiz Section */}
      <Quiz 
        questions={content.quiz || []}
        moduleId={moduleId}
        lessonId={lessonId}
        onComplete={handleQuizComplete}
      />

      {/* Achievement */}
      {showAchievement && (
        <Achievement 
          title="Code Warrior"
          description="You successfully completed a coding task!"
          xp={25}
          onClose={() => setShowAchievement(false)}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center space-x-2"
        >
          <i className="fas fa-chevron-left"></i>
          <span>Previous Lesson</span>
        </Button>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Lesson {lessonId}</span>
        </div>
        
        <Button 
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center space-x-2"
        >
          <span>Next Lesson</span>
          <i className="fas fa-chevron-right"></i>
        </Button>
      </div>
    </div>
  );
}
