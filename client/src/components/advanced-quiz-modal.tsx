import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Quiz, QuizQuestion, QuizAnswer, QuestionType } from "@shared/schema";

interface AdvancedQuizModalProps {
  quiz: Quiz & { questions: QuizQuestion[] };
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: QuizAnswer[], timeSpent: number) => void;
}

export default function AdvancedQuizModal({ quiz, isOpen, onClose, onComplete }: AdvancedQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  useEffect(() => {
    if (isOpen && !startTime) {
      setStartTime(new Date());
    }
  }, [isOpen, startTime]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeSpent(0);
      setStartTime(null);
      setShowResults(false);
      setSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (startTime && !submitted) {
        setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, submitted]);

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const quizAnswers: QuizAnswer[] = quiz.questions.map(question => ({
      questionId: question.id,
      type: question.type,
      answer: answers[question.id] || null,
    }));

    onComplete(quizAnswers, timeSpent);
    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestionInput = () => {
    const answer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={answer?.toString() || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'true-false':
        return (
          <RadioGroup
            value={answer?.toString() || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        );

      case 'fill-blank':
        return (
          <Input
            value={answer || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Enter your answer..."
            className="w-full"
          />
        );

      case 'matching':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Match items from the left with items on the right:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Left Items</h4>
                {currentQuestion.leftItems.map((item, index) => (
                  <div key={index} className="p-2 border rounded">
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Right Items</h4>
                {currentQuestion.rightItems.map((item, index) => (
                  <div key={index} className="p-2 border rounded">
                    {String.fromCharCode(65 + index)}. {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Your matches (e.g., 1-A, 2-B):</Label>
              <Input
                value={answer || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="1-A, 2-B, 3-C..."
              />
            </div>
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-2">
            <Textarea
              value={answer || ""}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Write your answer here..."
              rows={6}
              className="w-full"
            />
            {currentQuestion.maxWords && (
              <p className="text-sm text-muted-foreground">
                Maximum words: {currentQuestion.maxWords}
              </p>
            )}
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'multiple-choice':
        return '◉';
      case 'true-false':
        return '✓';
      case 'fill-blank':
        return '▢';
      case 'matching':
        return '⟷';
      case 'essay':
        return '✍';
      default:
        return '?';
    }
  };

  if (showResults) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Quiz Completed!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Results Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Time Spent:</span>
                  <span className="font-semibold">{formatTime(timeSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-semibold">{Object.keys(answers).length} / {quiz.questions.length}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{quiz.title}</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {formatTime(timeSpent)}
            </div>
          </DialogTitle>
          {quiz.description && (
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Question */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getQuestionTypeIcon(currentQuestion.type)}</span>
                  Question {currentQuestionIndex + 1}
                </CardTitle>
                <Badge variant="outline">
                  {currentQuestion.type.replace('-', ' ')}
                </Badge>
              </div>
              <CardDescription className="text-base font-medium text-foreground">
                {currentQuestion.question}
              </CardDescription>
              {currentQuestion.points && (
                <p className="text-sm text-muted-foreground">
                  Points: {currentQuestion.points}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {renderQuestionInput()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length === 0}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                >
                  Next
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigation Dots */}
          <div className="flex justify-center gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary'
                    : answers[quiz.questions[index].id] !== undefined
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}