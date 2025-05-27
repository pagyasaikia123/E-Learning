import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  Lock, 
  BookOpen,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "@/components/progress-bar";
import { 
  formatPrice, 
  formatRating, 
  formatDuration, 
  getCategoryColor, 
  getLevelColor,
  generateStars
} from "@/lib/utils";
import type { CourseWithInstructor, LessonWithQuiz } from "@shared/schema";

// Mock user ID - in a real app this would come from auth context
const CURRENT_USER_ID = 3;

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id!);
  const { toast } = useToast();
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  const { data: course, isLoading } = useQuery<CourseWithInstructor>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: lessons } = useQuery<LessonWithQuiz[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });

  const { data: enrollmentStatus } = useQuery<{ isEnrolled: boolean }>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/courses/${courseId}/enrollment`],
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/enrollments', {
      userId: CURRENT_USER_ID,
      courseId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${CURRENT_USER_ID}/courses/${courseId}/enrollment`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${CURRENT_USER_ID}/enrollments`] 
      });
      toast({
        title: "Enrolled successfully!",
        description: "You can now start learning this course.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        </div>
      </div>
    );
  }

  const isEnrolled = enrollmentStatus?.isEnrolled;
  const stars = generateStars(course.rating || 0);
  const totalDuration = lessons?.reduce((acc, lesson) => acc + lesson.duration, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Preview */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <img
              src={course.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button size="lg" className="rounded-full w-16 h-16">
                <Play className="h-6 w-6 ml-1" />
              </Button>
            </div>
          </div>

          {/* Course Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(course.category)}>
                {course.category}
              </Badge>
              <span className={`text-sm font-medium ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>

            <p className="text-lg text-gray-600">{course.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {stars.map((star, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        star === 'full' ? 'fill-current' : star === 'half' ? 'fill-current opacity-50' : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-1">
                  {formatRating(course.rating || 0)} ({course.enrollmentCount})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount} students</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(totalDuration)} total</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={course.instructor.avatar} />
                <AvatarFallback>
                  {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {course.instructor.firstName} {course.instructor.lastName}
                </p>
                <p className="text-sm text-gray-500">Course Instructor</p>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
            
            {lessons && lessons.length > 0 ? (
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <Card key={lesson.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {isEnrolled ? (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Play className="h-4 w-4 text-primary" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {index + 1}. {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {lesson.quiz && (
                            <Badge variant="outline" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Quiz
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDuration(lesson.duration)}
                          </span>
                          {isEnrolled && (
                            <Link href={`/lessons/${lesson.id}`}>
                              <Button size="sm" variant="ghost">
                                <Play className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Course content will be available soon.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(course.price)}
                </div>
                
                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Enrolled</span>
                    </div>
                    {course.userProgress !== undefined && (
                      <div className="space-y-2">
                        <ProgressBar 
                          value={course.userProgress} 
                          showLabel
                          className="w-full"
                        />
                      </div>
                    )}
                    {lessons && lessons.length > 0 && (
                      <Link href={`/lessons/${lessons[0].id}`}>
                        <Button className="w-full" size="lg">
                          {course.userProgress === 0 ? "Start Learning" : "Continue Learning"}
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This course includes:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Play className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{lessons?.length || 0} video lessons</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{formatDuration(totalDuration)} of content</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Certificate of completion</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Lifetime access</span>
              </div>
            </CardContent>
          </Card>

          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Students:</span>
                <span className="text-sm font-medium">{course.enrollmentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Language:</span>
                <span className="text-sm font-medium">English</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Level:</span>
                <span className="text-sm font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Duration:</span>
                <span className="text-sm font-medium">{formatDuration(totalDuration)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
