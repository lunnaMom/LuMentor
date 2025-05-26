import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  task: string;
  moduleId: number;
  lessonId: number;
  onComplete: () => void;
}

export function CodeEditor({ task, moduleId, lessonId, onComplete }: CodeEditorProps) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    
    // Simulate code execution
    setTimeout(() => {
      // Simple validation - check if code contains basic keywords
      const hasValidSyntax = code.includes("Paint") || code.includes("Canvas") || 
                            code.includes("int") || code.includes("String") ||
                            code.includes("if") || code.includes("for");
      
      if (hasValidSyntax && code.trim().length > 10) {
        setResult("Great job! Your code ran successfully! 🎉");
        onComplete();
      } else {
        setResult("Try adding some code that matches the task description. You can do it! 💪");
      }
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-keyboard text-purple-600"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">🎯 Your Turn to Code!</h2>
      </div>
      
      <p className="text-gray-700 mb-4">
        <strong>Task:</strong> {task}
      </p>

      {/* Code Editor Mockup */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden mb-4">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 text-sm font-medium">Code Editor</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <Button 
            size="sm"
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? (
              <>
                <i className="fas fa-spinner animate-spin mr-1"></i>
                Running...
              </>
            ) : (
              <>
                <i className="fas fa-play mr-1"></i>
                Run Code
              </>
            )}
          </Button>
        </div>
        <div className="p-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Write your Java code here..."
            className="w-full h-32 bg-transparent text-gray-300 font-mono text-sm resize-none outline-none"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          />
        </div>
      </div>

      {/* Hint Panel */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <i className="fas fa-lightbulb text-amber-600"></i>
          <span className="font-semibold text-amber-800">Helpful Hints 💡</span>
        </div>
        <ul className="text-amber-800 text-sm space-y-1">
          <li>• Remember to follow Java syntax rules</li>
          <li>• Use semicolons at the end of statements</li>
          <li>• Check the lesson examples for reference</li>
          <li>• Don't worry about perfect code - focus on learning!</li>
        </ul>
      </div>

      {/* Task Feedback */}
      {result && (
        <div className={`border rounded-lg p-4 ${
          result.includes("Great job") 
            ? "bg-green-50 border-green-200" 
            : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`fas ${
              result.includes("Great job") 
                ? "fa-check-circle text-green-600" 
                : "fa-info-circle text-blue-600"
            }`}></i>
            <span className={`font-semibold ${
              result.includes("Great job") 
                ? "text-green-800" 
                : "text-blue-800"
            }`}>
              {result.includes("Great job") ? "Success!" : "Keep Trying!"}
            </span>
          </div>
          <p className={`mt-1 ${
            result.includes("Great job") 
              ? "text-green-700" 
              : "text-blue-700"
          }`}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
