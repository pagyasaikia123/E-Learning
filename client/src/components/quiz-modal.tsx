import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import ProgressBar from "./progress-bar";
import type { Quiz } from "@shared/schema";

interface QuizModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, answers: number[]) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function QuizModal({ quiz, isOpen, onClose, onComplete }: QuizModalProps) {
  const questions = quiz.questions as Question[];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1]);
    } else {
      calculateResults();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
    }
  };

  const calculateResults = () => {
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    setShowResults(true);
    onComplete(score, answers.map(a => a || 0));
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setSelectedAnswer(null);
    setShowResults(false);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  if (showResults) {
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
              <p className="text-gray-600">
                You got {correctAnswers} out of {questions.length} questions correct
              </p>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <Card key={question.id} className={`border-l-4 ${
                    isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {question.question}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="text-green-600">
                              <strong>Correct:</strong> {question.options[question.correctAnswer]}
                            </div>
                            {!isCorrect && userAnswer !== null && (
                              <div className="text-red-600">
                                <strong>Your answer:</strong> {question.options[userAnswer]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetQuiz}>
                Retake Quiz
              </Button>
              <Button onClick={handleClose}>
                Continue Learning
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <ProgressBar value={progress} />
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {currentQuestion.question}
            </h3>

            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button 
              onClick={goToNextQuestion}
              disabled={selectedAnswer === null}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
              {currentQuestionIndex < questions.length - 1 && (
                <ArrowRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
