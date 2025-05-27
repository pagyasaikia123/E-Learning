import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Clock, CheckCircle } from "lucide-react";
import AdvancedQuizModal from "./advanced-quiz-modal";
import type { Quiz, QuizQuestion, QuizAnswer } from "@shared/schema";

export default function QuizDemo() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [completedQuiz, setCompletedQuiz] = useState(false);

  // Demo quiz with all question types
  const demoQuiz: Quiz & { questions: QuizQuestion[] } = {
    id: 999,
    lessonId: 1,
    title: "Advanced Learning Assessment",
    description: "Experience our new quiz system with multiple question types including multiple choice, true/false, fill-in-the-blank, matching, and essay questions!",
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: "Which of the following is a JavaScript framework for building user interfaces?",
        points: 2,
        options: ["React", "Python", "MySQL", "Photoshop"],
        correctAnswer: 0,
        explanation: "React is a popular JavaScript library for building user interfaces, especially for web applications."
      },
      {
        id: 2,
        type: 'true-false',
        question: "TypeScript is a superset of JavaScript that adds static typing.",
        points: 1,
        correctAnswer: true,
        explanation: "Correct! TypeScript extends JavaScript by adding optional static type definitions."
      },
      {
        id: 3,
        type: 'fill-blank',
        question: "The _____ method in JavaScript is used to iterate over arrays and return a new array.",
        points: 2,
        correctAnswers: ["map", "map()", ".map()", "Array.map"],
        caseSensitive: false,
        explanation: "The map() method creates a new array with the results of calling a function for every array element."
      },
      {
        id: 4,
        type: 'matching',
        question: "Match the programming concepts with their descriptions:",
        points: 3,
        leftItems: ["Variable", "Function", "Array"],
        rightItems: ["A collection of values", "A reusable block of code", "A container for data"],
        correctMatches: { 0: 2, 1: 1, 2: 0 },
        explanation: "Variables store data, functions contain reusable code, and arrays hold collections of values."
      },
      {
        id: 5,
        type: 'essay',
        question: "Explain the benefits of using a component-based architecture in modern web development.",
        points: 5,
        maxWords: 150,
        rubric: "Look for mentions of reusability, maintainability, modularity, and testing benefits.",
        explanation: "Component-based architecture promotes reusability, easier maintenance, better organization, and improved testing capabilities."
      }
    ],
    timeLimit: 10,
    passingScore: 70,
    allowRetries: true,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    createdAt: new Date(),
  };

  const handleQuizComplete = (answers: QuizAnswer[], timeSpent: number) => {
    console.log("Quiz completed!", { answers, timeSpent });
    setCompletedQuiz(true);
    setIsQuizOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Advanced Quiz System Demo
              </CardTitle>
              <CardDescription>
                Try our new interactive quiz with multiple question types
              </CardDescription>
            </div>
            {completedQuiz && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-4 h-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>5 Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>10 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>70% to pass</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Question Types Include:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Multiple Choice</Badge>
              <Badge variant="outline">True/False</Badge>
              <Badge variant="outline">Fill in the Blank</Badge>
              <Badge variant="outline">Matching</Badge>
              <Badge variant="outline">Essay</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Real-time timer and progress tracking</li>
              <li>• Multiple answer formats for comprehensive assessment</li>
              <li>• Instant feedback and explanations</li>
              <li>• Flexible scoring system</li>
              <li>• Question navigation and review</li>
            </ul>
          </div>

          <Button 
            onClick={() => setIsQuizOpen(true)}
            className="w-full"
            disabled={completedQuiz}
          >
            {completedQuiz ? "Quiz Completed" : "Start Advanced Quiz Demo"}
          </Button>
        </CardContent>
      </Card>

      <AdvancedQuizModal
        quiz={demoQuiz}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}