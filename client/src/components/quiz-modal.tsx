import React, { useState, useEffect, useCallback, useMemo } from "react"; // Added useEffect, useCallback, useMemo
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card"; // Added CardDescription
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added
  DialogFooter, // Added
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Added for fill-blank
import { Textarea } from "@/components/ui/textarea"; // Added for essay/matching
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, PlayCircle, Info } from "lucide-react"; // Added Clock, PlayCircle, Info
import ProgressBar from "./progress-bar"; // Assuming this exists and works
import type { Quiz, QuizQuestion, QuizAnswer, MultipleChoiceQuestion, TrueFalseQuestion, FillBlankQuestion, QuizAttempt } from "@shared/schema";

interface QuizModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: QuizAnswer[], timeSpent: number) => void; // Updated
  attemptResult?: QuizAttempt | null; // For displaying results from backend
}

export default function QuizModal({ quiz, isOpen, onClose, onComplete, attemptResult }: QuizModalProps) {
  const questions = useMemo(() => quiz.questions as QuizQuestion[], [quiz.questions]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({}); // { [questionId: number]: any }
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false); // This will be true when attemptResult is available

  const currentQuestion = questions[currentQuestionIndex];
  const progress = quizStarted && !attemptResult ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  const totalTimeSpent = useMemo(() => {
    if (quiz.timeLimit && timeLeft !== null) {
      return quiz.timeLimit * 60 - timeLeft;
    }
    return 0; // Or track time spent actively if no time limit
  }, [timeLeft, quiz.timeLimit]);


  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeLeft === null || attemptResult) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
    }, 1000);

    return () => clearInterval(timerId);
  }, [quizStarted, timeLeft, attemptResult]);

  // Reset state when quiz changes or modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setQuizStarted(false);
      setQuizFinished(!!attemptResult); // If there's an attempt result, quiz is considered finished
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
    }
  }, [isOpen, quiz, attemptResult]); // Added attemptResult dependency

  const handleAnswerChange = (questionId: number, answer: any) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = useCallback(() => {
    const formattedAnswers: QuizAnswer[] = questions.map(q => ({
      questionId: q.id,
      type: q.type, // Include question type
      answer: userAnswers[q.id] !== undefined ? userAnswers[q.id] : null,
    }));
    onComplete(formattedAnswers, totalTimeSpent);
    // Parent will set attemptResult, which will trigger the results view via useEffect
  }, [questions, userAnswers, onComplete, totalTimeSpent]);


  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null); // Re-initialize timer
  };
  
  const handleCloseAndReset = () => {
    onClose(); // This will trigger the useEffect to reset state due to isOpen changing
  };


  // Render Logic
  if (!isOpen) return null;

  // Results View (triggered by attemptResult prop)
  if (attemptResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseAndReset}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz Results: {quiz.title}</DialogTitle>
            <DialogDescription>
              You scored {attemptResult.score}% and {attemptResult.passed ? "Passed" : "Failed"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <p>Correct Answers: {attemptResult.correctAnswers} / {attemptResult.totalQuestions}</p>
            <p>Time Spent: {Math.floor(attemptResult.timeSpent / 60)}m {attemptResult.timeSpent % 60}s</p>

            {quiz.showCorrectAnswers && attemptResult.answers?.map((ans, index) => {
              const question = questions.find(q => q.id === ans.questionId);
              if (!question) return null;
              
              let studentAnswerDisplay = String(ans.answer);
              let correctAnswerDisplay = "";

              if (question.type === 'multiple-choice') {
                const mcq = question as MultipleChoiceQuestion;
                studentAnswerDisplay = typeof ans.answer === 'number' ? mcq.options[ans.answer as number] || "Not answered" : String(ans.answer);
                correctAnswerDisplay = mcq.options[mcq.correctAnswer];
              } else if (question.type === 'true-false') {
                studentAnswerDisplay = ans.answer === true ? "True" : ans.answer === false ? "False" : "Not answered";
                const tfq = question as TrueFalseQuestion;
                correctAnswerDisplay = tfq.correctAnswer ? "True" : "False";
              } else if (question.type === 'fill-blank') {
                 const fbq = question as FillBlankQuestion;
                 correctAnswerDisplay = fbq.correctAnswers.join(' / ');
              }
              // Matching and Essay answers are just text
              
              return (
                <Card key={ans.questionId} className={`border-l-4 ${ans.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                  <CardContent className="p-4">
                    <p className="font-medium mb-1">{index + 1}. {question.question}</p>
                    <p className={`text-sm ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      Your answer: {studentAnswerDisplay || "Not answered"} {ans.isCorrect ? <CheckCircle className="inline h-4 w-4 ml-1"/> : <XCircle className="inline h-4 w-4 ml-1"/>}
                    </p>
                    {!ans.isCorrect && correctAnswerDisplay && (
                      <p className="text-sm text-blue-700">Correct answer: {correctAnswerDisplay}</p>
                    )}
                    {question.explanation && <p className="text-xs text-gray-500 mt-1 italic">Explanation: {question.explanation}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseAndReset}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Start Screen
  if (!quizStarted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseAndReset}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{quiz.title}</DialogTitle>
            {quiz.description && <DialogDescription>{quiz.description}</DialogDescription>}
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center"><Info className="h-5 w-5 mr-2 text-blue-500" /> Number of questions: {questions.length}</div>
            {quiz.timeLimit && <div className="flex items-center"><Clock className="h-5 w-5 mr-2 text-blue-500" /> Time limit: {quiz.timeLimit} minutes</div>}
            {quiz.passingScore && <div className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Passing score: {quiz.passingScore}%</div>}
          </div>
          <DialogFooter>
            <Button onClick={handleStartQuiz} size="lg">
              <PlayCircle className="mr-2 h-5 w-5" /> Start Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Quiz Taking UI
  const currentQ = questions[currentQuestionIndex] as QuizQuestion; // Type assertion
  const currentAnswer = userAnswers[currentQ.id];

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAndReset}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
          {timeLeft !== null && (
            <DialogDescription>
              Time Left: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 my-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <ProgressBar value={progress} />
          </div>

          <div className="space-y-3 p-1 rounded-md border min-h-[200px]">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              {currentQ.question} <span className="text-xs text-gray-500">({currentQ.points} pts)</span>
            </h3>

            {currentQ.type === 'multiple-choice' && (
              <RadioGroup
                value={currentAnswer !== undefined ? String(currentAnswer) : ""}
                onValueChange={(value) => handleAnswerChange(currentQ.id, (currentQ as MultipleChoiceQuestion).options.indexOf(value))} // Store index or value based on backend
                className="space-y-2"
              >
                {(currentQ as MultipleChoiceQuestion).options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={option} id={`q${currentQ.id}-option-${index}`} />
                    <Label htmlFor={`q${currentQ.id}-option-${index}`} className="flex-1 cursor-pointer text-sm">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === 'true-false' && (
              <RadioGroup
                value={currentAnswer !== undefined ? String(currentAnswer) : ""}
                onValueChange={(value) => handleAnswerChange(currentQ.id, value === "true")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="true" id={`q${currentQ.id}-true`} />
                  <Label htmlFor={`q${currentQ.id}-true`} className="flex-1 cursor-pointer text-sm">True</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="false" id={`q${currentQ.id}-false`} />
                  <Label htmlFor={`q${currentQ.id}-false`} className="flex-1 cursor-pointer text-sm">False</Label>
                </div>
              </RadioGroup>
            )}

            {currentQ.type === 'fill-blank' && (
              <Input
                type="text"
                placeholder="Your answer here..."
                value={currentAnswer || ""}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                className="text-sm"
              />
            )}
            
            {(currentQ.type === 'matching' || currentQ.type === 'essay') && (
                 <Textarea
                    placeholder="Your answer here..."
                    value={currentAnswer || ""}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    rows={4}
                    className="text-sm"
                />
            )}
          </div>

          <DialogFooter className="flex justify-between pt-4">
            <Button 
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={goToNextQuestion}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmitQuiz} variant="default">
                Submit Quiz
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
