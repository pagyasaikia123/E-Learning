import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle, Clock, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCard from "@/components/course-card";
import type { CourseWithInstructor, UserStats } from "@shared/schema";

// Mock user ID - in a real app this would come from auth context
const CURRENT_USER_ID = 3;

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: [`/api/users/${CURRENT_USER_ID}`],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/stats`],
  });

  const { data: enrolledCourses, isLoading: coursesLoading } = useQuery<CourseWithInstructor[]>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/enrollments`],
  });

  const { data: recommendedCourses, isLoading: recommendedLoading } = useQuery<CourseWithInstructor[]>({
    queryKey: ['/api/courses', { limit: 3, offset: 0 }],
  });

  const continueLearningCourses = enrolledCourses?.filter(course => 
    course.userProgress !== undefined && course.userProgress < 100
  ) || [];

  if (statsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'John'}!
        </h1>
        <p className="mt-1 text-lg text-gray-600">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Enrolled Courses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.enrolledCourses || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.completedCourses || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hours Learned
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.hoursLearned || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Certificates
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.certificates || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      {continueLearningCourses.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
            <Link href="/courses?enrolled=true">
              <Button variant="ghost">View all</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {continueLearningCourses.slice(0, 2).map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="flex">
                  <img
                    src={course.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=150&fit=crop"}
                    alt={course.title}
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          by {course.instructor.firstName} {course.instructor.lastName}
                        </p>
                        <div className="flex items-center mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-primary h-2 rounded-full progress-bar"
                              style={{ width: `${course.userProgress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">
                            {course.userProgress}%
                          </span>
                        </div>
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm">Continue</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Course Recommendations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          <Link href="/courses">
            <Button variant="ghost">View all</Button>
          </Link>
        </div>

        {recommendedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    Completed lesson "Introduction to React Hooks"
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Complete Web Development Bootcamp
                </p>
                <p className="mt-0.5 text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    Earned certificate for "JavaScript Fundamentals"
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">1 day ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    Passed quiz "Data Types and Variables" with 95%
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Data Science Fundamentals
                </p>
                <p className="mt-0.5 text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
