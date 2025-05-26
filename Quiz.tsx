import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubmitQuiz } from "@/hooks/useProgress";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizProps {
  questions: QuizQuestion[];
  moduleId: number;
  lessonId: number;
  onComplete: () => void;
}

export function Quiz({ questions, moduleId, lessonId, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const submitQuiz = useSubmitQuiz();

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(answer => answer === -1)) return;
    
    try {
      const response = await submitQuiz.mutateAsync({
        moduleId,
        lessonId,
        answers
      });
      
      setResult(response);
      setSubmitted(true);
      
      if (response.passed) {
        onComplete();
      }
    } catch (error) {
      console.error("Quiz submission failed:", error);
    }
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-question-circle text-orange-600"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">🧠 Quick Quiz!</h2>
      </div>
      
      <p className="text-gray-700 mb-6">
        Let's see how much you remember! Don't worry - this is just to help you learn better! 😊
      </p>

      {/* Quiz Questions */}
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Question {questionIndex + 1}: {question.question}
          </h3>
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => {
              const isSelected = answers[questionIndex] === optionIndex;
              const isCorrect = optionIndex === question.correct;
              const showResult = submitted;
              
              let className = "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors";
              
              if (showResult) {
                if (isSelected && isCorrect) {
                  className += " bg-green-50 border-green-200";
                } else if (isSelected && !isCorrect) {
                  className += " bg-red-50 border-red-200";
                } else if (isCorrect) {
                  className += " bg-green-50 border-green-200";
                } else {
                  className += " bg-gray-50 border-gray-200";
                }
              } else {
                if (isSelected) {
                  className += " bg-primary/5 border-primary/20";
                } else {
                  className += " border-gray-200 hover:bg-gray-50";
                }
              }

              return (
                <label 
                  key={optionIndex}
                  className={className}
                  onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                >
                  <input 
                    type="radio" 
                    name={`q${questionIndex}`}
                    value={optionIndex}
                    checked={isSelected}
                    onChange={() => {}} // Handled by onClick
                    className="text-primary focus:ring-primary"
                    disabled={submitted}
                  />
                  <span className="text-gray-700">{option}</span>
                  {showResult && isCorrect && (
                    <i className="fas fa-check text-green-600 ml-auto"></i>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <i className="fas fa-times text-red-600 ml-auto"></i>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quiz Submit Button */}
      {!submitted && (
        <Button 
          onClick={handleSubmit}
          disabled={answers.some(answer => answer === -1) || submitQuiz.isPending}
          className="w-full"
        >
          {submitQuiz.isPending ? (
            <>
              <i className="fas fa-spinner animate-spin mr-2"></i>
              Checking Answers...
            </>
          ) : (
            <>
              <i className="fas fa-check mr-2"></i>
              Check My Answers!
            </>
          )}
        </Button>
      )}

      {/* Quiz Results */}
      {result && (
        <div className={`border rounded-lg p-4 mt-4 ${
          result.passed 
            ? "bg-green-50 border-green-200" 
            : "bg-yellow-50 border-yellow-200"
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <i className={`fas ${
              result.passed 
                ? "fa-check-circle text-green-600" 
                : "fa-exclamation-triangle text-yellow-600"
            }`}></i>
            <span className={`font-semibold ${
              result.passed 
                ? "text-green-800" 
                : "text-yellow-800"
            }`}>
              {result.passed ? "Excellent!" : "Good Try!"}
            </span>
          </div>
          <p className={`${
            result.passed 
              ? "text-green-700" 
              : "text-yellow-700"
          }`}>
            You scored {result.score}% ({result.correct}/{result.total} correct).
            {result.passed 
              ? " You're ready for the next lesson!" 
              : " Review the lesson and try again when you're ready!"}
          </p>
        </div>
      )}
    </div>
  );
}
