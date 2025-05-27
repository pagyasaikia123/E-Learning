import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import type { CourseWithInstructor, LessonWithQuiz } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Edit3, PlusCircle, FileText, Clock, ListChecks, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import DashboardSectionHeader from '@/components/DashboardSectionHeader';
import EmptyState from '@/components/EmptyState';

const CourseContentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState<LessonWithQuiz | null>(null);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);

  const numericCourseId = parseInt(courseId || '0');

  const { data: course, isLoading: courseLoading, error: courseError } = useQuery<CourseWithInstructor>({
    queryKey: [`/api/courses/${numericCourseId}`],
    queryFn: () => apiRequest('GET', `/api/courses/${numericCourseId}`),
    enabled: !!numericCourseId && !authLoading,
  });

  const { data: lessons, isLoading: lessonsLoading, error: lessonsError } = useQuery<LessonWithQuiz[]>({
    queryKey: [`/api/courses/${numericCourseId}/lessons`],
    queryFn: () => apiRequest('GET', `/api/courses/${numericCourseId}/lessons`),
    enabled: !!numericCourseId && !authLoading,
  });

  const handleOpenQuizDialog = (lesson: LessonWithQuiz, isEditing: boolean) => {
    setSelectedLessonForQuiz(lesson);
    setIsEditingQuiz(isEditing);
    setShowQuizDialog(true);
  };

  if (authLoading || courseLoading || lessonsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-6 w-3/4 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-3/5" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (courseError || lessonsError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to load course content</h2>
        <p className="text-gray-600">
          {(courseError as Error)?.message || (lessonsError as Error)?.message || "An unknown error occurred."}
        </p>
        <Link href="/instructor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
       <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState 
          icon={HelpCircle}
          title="Course Not Found"
          message="The course you are looking for could not be found."
          actionButton={{text: "Back to Dashboard", href: "/instructor"}}
        />
      </div>
    );
  }
  
  // Authorization check (basic)
  if (user?.id !== course.instructorId) {
     return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">You are not authorized to manage content for this course.</p>
         <Link href="/instructor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <DashboardSectionHeader
        title={`Manage Content: ${course.title}`}
        actionComponent={
          <Link href="/instructor">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        }
      />

      <div className="mb-8">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Lesson
        </Button>
      </div>

      {lessons && lessons.length > 0 ? (
        <div className="space-y-6">
          {lessons.sort((a, b) => a.order - b.order).map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{lesson.order}. {lesson.title}</CardTitle>
                  <CardDescription>
                    Duration: {Math.round((lesson.duration || 0) / 60)} min
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit3 className="mr-1 h-3 w-3" /> Edit Lesson
                  </Button>
                  {/* Placeholder for delete lesson */}
                </div>
              </CardHeader>
              <CardContent>
                {lesson.description && <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>}
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div className="flex items-center">
                    {lesson.quiz ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <HelpCircle className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <span className="text-sm font-medium">
                      {lesson.quiz ? `Quiz: ${lesson.quiz.title}` : "No quiz attached"}
                    </span>
                  </div>
                  {lesson.quiz ? (
                    <Button variant="secondary" size="sm" onClick={() => handleOpenQuizDialog(lesson, true)}>
                      <Edit3 className="mr-1 h-3 w-3" /> Edit Quiz
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" onClick={() => handleOpenQuizDialog(lesson, false)}>
                      <PlusCircle className="mr-1 h-3 w-3" /> Add Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="No Lessons Yet"
          message="This course doesn't have any lessons. Start by adding your first lesson."
          actionButton={{ text: "Add New Lesson", onClick: () => { /* TODO: Implement add lesson functionality */ } }}
        />
      )}

      {/* Placeholder Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingQuiz ? "Edit Quiz" : "Add Quiz"} for: {selectedLessonForQuiz?.title}
            </DialogTitle>
            <DialogDescription>
              Quiz builder for lesson '{selectedLessonForQuiz?.title}' will be here.
              <br />
              Current Quiz ID: {selectedLessonForQuiz?.quiz?.id || "N/A (New Quiz)"}
              <br />
              <br />
              <strong>This feature is coming soon!</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
            {/* <Button type="submit" disabled>Save Quiz (Coming Soon)</Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseContentPage;
