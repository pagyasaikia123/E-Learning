import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Award, 
  SkipBack, 
  SkipForward,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "@/components/video-player";
import QuizModal from "@/components/quiz-modal";
import ProgressBar from "@/components/progress-bar";
import { formatDuration } from "@/lib/utils";
import type { LessonWithQuiz, CourseWithInstructor, LessonProgress } from "@shared/schema";

// Mock user ID - in a real app this would come from auth context
const CURRENT_USER_ID = 3;

export default function Lesson() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id!);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showQuiz, setShowQuiz] = useState(false);
  const [watchTime, setWatchTime] = useState(0);

  const { data: lesson, isLoading } = useQuery<LessonWithQuiz>({
    queryKey: [`/api/lessons/${lessonId}`],
  });

  const { data: course } = useQuery<CourseWithInstructor>({
    queryKey: [`/api/courses/${lesson?.courseId}`],
    enabled: !!lesson?.courseId,
  });

  const { data: allLessons } = useQuery<LessonWithQuiz[]>({
    queryKey: [`/api/courses/${lesson?.courseId}/lessons`],
    enabled: !!lesson?.courseId,
  });

  const { data: progress } = useQuery<LessonProgress>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/lessons/${lessonId}/progress`],
    enabled: !!lessonId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: (data: { completed?: boolean; watchTime?: number }) =>
      apiRequest('POST', '/api/lesson-progress', {
        userId: CURRENT_USER_ID,
        lessonId,
        completed: data.completed ?? progress?.completed ?? false,
        watchTime: data.watchTime ?? watchTime,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${CURRENT_USER_ID}/lessons/${lessonId}/progress`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${CURRENT_USER_ID}/enrollments`] 
      });
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: (data: { score: number; answers: number[] }) =>
      apiRequest('POST', '/api/quiz-attempts', {
        userId: CURRENT_USER_ID,
        quizId: lesson?.quiz?.id,
        score: data.score,
        answers: data.answers,
      }),
    onSuccess: (_, variables) => {
      toast({
        title: "Quiz completed!",
        description: `You scored ${variables.score}%`,
      });
      setShowQuiz(false);
    },
  });

  useEffect(() => {
    // Update watch time every 5 seconds
    const interval = setInterval(() => {
      if (watchTime > 0) {
        updateProgressMutation.mutate({ watchTime });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [watchTime]);

  const handleVideoTimeUpdate = (currentTime: number) => {
    setWatchTime(currentTime);
  };

  const handleVideoEnded = () => {
    if (!progress?.completed) {
      updateProgressMutation.mutate({ 
        completed: true, 
        watchTime: lesson?.duration || 0 
      });
      toast({
        title: "Lesson completed!",
        description: "Great job! You've finished this lesson.",
      });
    }
  };

  const markAsComplete = () => {
    updateProgressMutation.mutate({ completed: true });
    toast({
      title: "Lesson marked as complete",
      description: "You can now proceed to the next lesson.",
    });
  };

  const navigateToLesson = (targetLessonId: number) => {
    setLocation(`/lessons/${targetLessonId}`);
  };

  const currentLessonIndex = allLessons?.findIndex(l => l.id === lessonId) ?? -1;
  const previousLesson = currentLessonIndex > 0 ? allLessons?.[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < (allLessons?.length ?? 0) - 1 ? allLessons?.[currentLessonIndex + 1] : null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lesson not found</h1>
          <p className="text-gray-600 mt-2">The lesson you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const LessonSidebar = () => (
    <div className="space-y-6">
      {/* Course Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link href={`/courses/${course?.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </Link>
          </div>
          <CardTitle className="text-lg">{course?.title}</CardTitle>
        </CardHeader>
      </Card>

      {/* Lesson Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Content</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {allLessons?.map((lessonItem, index) => (
              <div
                key={lessonItem.id}
                className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  lessonItem.id === lessonId ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => navigateToLesson(lessonItem.id)}
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    lessonItem.id === lessonId 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {lessonItem.id === lessonId ? (
                      <BookOpen className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${
                    lessonItem.id === lessonId ? 'text-primary' : 'text-gray-900'
                  }`}>
                    {lessonItem.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDuration(lessonItem.duration)}
                    </span>
                    {lessonItem.quiz && (
                      <Badge variant="outline" className="text-xs">
                        Quiz
                      </Badge>
                    )}
                  </div>
                </div>
                {progress?.completed && lessonItem.id === lessonId && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center justify-between">
            <Link href={`/courses/${course?.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4 mr-2" />
                  Course Content
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <LessonSidebar />
              </SheetContent>
            </Sheet>
          </div>

          {/* Video Player */}
          <div className="space-y-4">
            <VideoPlayer
              src={lesson.videoUrl || ""}
              title={lesson.title}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full aspect-video"
            />
          </div>

          {/* Lesson Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <div className="flex items-center gap-2">
                {progress?.completed ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Button onClick={markAsComplete} disabled={updateProgressMutation.isPending}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>

            {lesson.description && (
              <p className="text-gray-600">{lesson.description}</p>
            )}

            {/* Progress Bar */}
            {lesson.duration > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Watch Progress</span>
                  <span>{Math.round((watchTime / lesson.duration) * 100)}%</span>
                </div>
                <ProgressBar 
                  value={watchTime} 
                  max={lesson.duration}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Quiz Section */}
          {lesson.quiz && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {lesson.quiz.title}
                    </h3>
                    <p className="text-gray-600">
                      Test your knowledge with this quiz
                    </p>
                  </div>
                  <Button onClick={() => setShowQuiz(true)}>
                    <Award className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              {previousLesson ? (
                <Button 
                  variant="outline" 
                  onClick={() => navigateToLesson(previousLesson.id)}
                >
                  <SkipBack className="h-4 w-4 mr-2" />
                  Previous: {previousLesson.title}
                </Button>
              ) : (
                <div></div>
              )}
            </div>
            
            <div>
              {nextLesson ? (
                <Button onClick={() => navigateToLesson(nextLesson.id)}>
                  Next: {nextLesson.title}
                  <SkipForward className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Link href={`/courses/${course?.id}`}>
                  <Button>
                    Course Overview
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block">
          <LessonSidebar />
        </div>
      </div>

      {/* Quiz Modal */}
      {lesson.quiz && (
        <QuizModal
          quiz={lesson.quiz}
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          onComplete={(score, answers) => {
            submitQuizMutation.mutate({ score, answers });
          }}
        />
      )}
    </div>
  );
}
