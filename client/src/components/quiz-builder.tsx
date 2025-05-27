import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit3 } from "lucide-react";
import type { QuizQuestion, QuestionType } from "@shared/schema";

interface QuizBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: {
    title: string;
    description?: string;
    questions: QuizQuestion[];
    timeLimit?: number;
    passingScore?: number;
    allowRetries?: boolean;
    shuffleQuestions?: boolean;
    showCorrectAnswers?: boolean;
  }) => void;
  lessonId: number;
}

export default function QuizBuilder({ isOpen, onClose, onSave, lessonId }: QuizBuilderProps) {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [passingScore, setPassingScore] = useState(70);
  const [allowRetries, setAllowRetries] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  const resetForm = () => {
    setQuizTitle("");
    setQuizDescription("");
    setTimeLimit(undefined);
    setPassingScore(70);
    setAllowRetries(true);
    setShuffleQuestions(false);
    setShowCorrectAnswers(true);
    setQuestions([]);
    setEditingQuestion(null);
  };

  const handleSave = () => {
    if (!quizTitle || questions.length === 0) return;

    onSave({
      title: quizTitle,
      description: quizDescription || undefined,
      questions,
      timeLimit,
      passingScore,
      allowRetries,
      shuffleQuestions,
      showCorrectAnswers,
    });

    resetForm();
    onClose();
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      type,
      question: "",
      points: 1,
      explanation: "",
      ...(type === 'multiple-choice' && {
        options: ["", "", "", ""],
        correctAnswer: 0,
        allowMultiple: false,
      }),
      ...(type === 'true-false' && {
        correctAnswer: true,
      }),
      ...(type === 'fill-blank' && {
        correctAnswers: [""],
        caseSensitive: false,
      }),
      ...(type === 'matching' && {
        leftItems: ["", ""],
        rightItems: ["", ""],
        correctMatches: {},
      }),
      ...(type === 'essay' && {
        maxWords: undefined,
        rubric: "",
      }),
    } as QuizQuestion;

    setEditingQuestion(newQuestion);
  };

  const saveQuestion = (question: QuizQuestion) => {
    if (questions.find(q => q.id === question.id)) {
      setQuestions(prev => prev.map(q => q.id === question.id ? question : q));
    } else {
      setQuestions(prev => [...prev, question]);
    }
    setEditingQuestion(null);
  };

  const deleteQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const renderQuestionEditor = () => {
    if (!editingQuestion) return null;

    const updateQuestion = (updates: Partial<QuizQuestion>) => {
      setEditingQuestion(prev => prev ? { ...prev, ...updates } : null);
    };

    return (
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion.type === 'multiple-choice' && 'Multiple Choice Question'}
              {editingQuestion.type === 'true-false' && 'True/False Question'}
              {editingQuestion.type === 'fill-blank' && 'Fill in the Blank Question'}
              {editingQuestion.type === 'matching' && 'Matching Question'}
              {editingQuestion.type === 'essay' && 'Essay Question'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={editingQuestion.question}
                onChange={(e) => updateQuestion({ question: e.target.value })}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={editingQuestion.points}
                  onChange={(e) => updateQuestion({ points: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Input
                  id="explanation"
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => updateQuestion({ explanation: e.target.value })}
                  placeholder="Explain the correct answer..."
                />
              </div>
            </div>

            {editingQuestion.type === 'multiple-choice' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editingQuestion.allowMultiple}
                    onCheckedChange={(checked) => updateQuestion({ allowMultiple: !!checked })}
                  />
                  <Label>Allow multiple correct answers</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Options</Label>
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = e.target.value;
                          updateQuestion({ options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Checkbox
                        checked={editingQuestion.correctAnswer === index}
                        onCheckedChange={(checked) => {
                          if (checked) updateQuestion({ correctAnswer: index });
                        }}
                      />
                      <Label className="text-sm">Correct</Label>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuestion({ options: [...editingQuestion.options, ""] })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {editingQuestion.type === 'true-false' && (
              <div>
                <Label>Correct Answer</Label>
                <Select
                  value={editingQuestion.correctAnswer.toString()}
                  onValueChange={(value) => updateQuestion({ correctAnswer: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingQuestion.type === 'fill-blank' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editingQuestion.caseSensitive}
                    onCheckedChange={(checked) => updateQuestion({ caseSensitive: !!checked })}
                  />
                  <Label>Case sensitive</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Acceptable Answers</Label>
                  {editingQuestion.correctAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={answer}
                        onChange={(e) => {
                          const newAnswers = [...editingQuestion.correctAnswers];
                          newAnswers[index] = e.target.value;
                          updateQuestion({ correctAnswers: newAnswers });
                        }}
                        placeholder={`Answer ${index + 1}`}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newAnswers = editingQuestion.correctAnswers.filter((_, i) => i !== index);
                            updateQuestion({ correctAnswers: newAnswers });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuestion({ correctAnswers: [...editingQuestion.correctAnswers, ""] })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Alternative Answer
                  </Button>
                </div>
              </div>
            )}

            {editingQuestion.type === 'essay' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxWords">Maximum Words (Optional)</Label>
                  <Input
                    id="maxWords"
                    type="number"
                    value={editingQuestion.maxWords || ""}
                    onChange={(e) => updateQuestion({ maxWords: parseInt(e.target.value) || undefined })}
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <Label htmlFor="rubric">Grading Rubric (Optional)</Label>
                  <Textarea
                    id="rubric"
                    value={editingQuestion.rubric || ""}
                    onChange={(e) => updateQuestion({ rubric: e.target.value })}
                    placeholder="Describe how this question should be graded..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => saveQuestion(editingQuestion)}
                disabled={!editingQuestion.question.trim()}
              >
                Save Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Advanced Quiz</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quiz Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Describe what this quiz covers..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={timeLimit || ""}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value) || undefined)}
                      placeholder="No limit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={allowRetries}
                      onCheckedChange={(checked) => setAllowRetries(!!checked)}
                    />
                    <Label>Allow retries</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={shuffleQuestions}
                      onCheckedChange={(checked) => setShuffleQuestions(!!checked)}
                    />
                    <Label>Shuffle questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={showCorrectAnswers}
                      onCheckedChange={(checked) => setShowCorrectAnswers(!!checked)}
                    />
                    <Label>Show correct answers</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Types */}
            <Card>
              <CardHeader>
                <CardTitle>Add Questions</CardTitle>
                <CardDescription>Choose the type of question you want to add</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  <Button variant="outline" onClick={() => addQuestion('multiple-choice')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Multiple Choice
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion('true-false')}>
                    <Plus className="w-4 h-4 mr-1" />
                    True/False
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion('fill-blank')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Fill Blank
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion('matching')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Matching
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion('essay')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Essay
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {questions.map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">
                            {question.type.replace('-', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {question.points} point{question.points !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="font-medium">{index + 1}. {question.question || "Untitled question"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!quizTitle || questions.length === 0}
              >
                Create Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderQuestionEditor()}
    </>
  );
}