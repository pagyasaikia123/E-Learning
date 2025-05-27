import { useQuery } from "@tanstack/react-query"; // useQueryClient removed as not directly used
import { BookOpen, CheckCircle, Clock, Trophy, Award, Activity as ActivityIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCard from "@/components/course-card";
import StatCard from "@/components/StatCard"; // Added
import DashboardSectionHeader from "@/components/DashboardSectionHeader"; // Added
import EmptyState from "@/components/EmptyState"; // Added
import type { CourseWithInstructor, UserStats, User } from "@shared/schema";
import { useAuth } from "../../contexts/AuthContext";

import { Card, CardContent } from "@/components/ui/card"; // For Recent Activity and Certificate cards
import { formatDate, getTimeAgo } from "@/lib/utils"; // Assuming these are moved to utils

// Define types for new sections (if not already in schema or a dedicated types file)
// Define types for new sections - These might come from @shared/schema or a global types file in a real app
interface ActivityItem {
  id: string;
  type: 'lesson' | 'quiz' | 'enrollment' | 'certificate';
  description: string;
  courseTitle?: string;
  timestamp: string; // ISO date string
}

interface CertificateItem {
  id: string;
  courseId: number;
  courseTitle: string;
  instructorName: string;
  completionDate: string; // ISO date string
  certificateUrl?: string; // Placeholder
}

export default function Dashboard() {
  const { user: authUser, isLoading: authLoading } = useAuth();

  if (!authLoading && !authUser) {
    return <Redirect to="/login" />;
  }
  
  const userId = authUser?.id;

  // Query for user details (can be optional if authUser has all needed info)
  const { data: userDetails, isLoading: userDetailsLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId, 
  });
  const displayUser = authUser || userDetails;

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: [`/api/users/${userId}/stats`],
    enabled: !!userId,
  });

  const { data: enrolledCourses, isLoading: coursesLoading } = useQuery<CourseWithInstructor[]>({
    queryKey: [`/api/users/${userId}/enrollments`],
    enabled: !!userId,
  });

  const { data: recommendedCourses, isLoading: recommendedLoading } = useQuery<CourseWithInstructor[]>({
    queryKey: ['/api/courses', { limit: 4, offset: 0, recommendedForUserId: userId }],
    enabled: !!userId,
  });

  // Mocked Recent Activity Query
  const { data: recentActivity, isLoading: activityLoading } = useQuery<ActivityItem[]>({
    queryKey: [`/api/users/${userId}/activity`],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!userId) return [];
      return [
        { id: '1', type: 'lesson', description: 'Completed lesson "Advanced State Management"', courseTitle: 'React Deep Dive', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
        { id: '2', type: 'quiz', description: 'Passed quiz "Component Lifecycle" with 90%', courseTitle: 'React Deep Dive', timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
        { id: '3', type: 'enrollment', description: 'Enrolled in "Node.js for Beginners"', timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
      ];
    },
    enabled: !!userId,
  });

  // Mocked My Certificates Query
  const { data: certificates, isLoading: certificatesLoading } = useQuery<CertificateItem[]>({
    queryKey: [`/api/users/${userId}/certificates`],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (!userId) return [];
      return [
        { id: 'cert1', courseId: 101, courseTitle: 'JavaScript Fundamentals', instructorName: 'Sarah Johnson', completionDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), certificateUrl: '#' },
        { id: 'cert2', courseId: 102, courseTitle: 'Python for Data Science', instructorName: 'Dr. Michael Chen', completionDate: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(), certificateUrl: '#' },
      ];
    },
    enabled: !!userId,
  });

  const continueLearningCourses = enrolledCourses?.filter(course => 
    course.userProgress !== undefined && course.userProgress < 100
  ).slice(0, 4) || [];

  const overallLoading = authLoading || userDetailsLoading || statsLoading;

  if (overallLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          {/* Stats Cards Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => <StatCard key={i} title="" value="" icon={BookOpen} isLoading={true} />)}
          </div>
          {/* Section Skeletons */}
          <DashboardSectionHeader title="" isLoading={true} actionComponent={<Skeleton className="h-10 w-24" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
          </div>
           <DashboardSectionHeader title="" isLoading={true} actionComponent={<Skeleton className="h-10 w-24" />} />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser) {
     return <Redirect to="/login" />; // Fallback, ProtectedRoute should handle this
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {displayUser?.firstName || 'Learner'}!
        </h1>
        <p className="mt-1 text-lg text-gray-600">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Enrolled Courses"
          value={stats?.enrolledCourses || 0}
          icon={BookOpen}
          iconColor="text-primary"
          isLoading={statsLoading}
        />
        <StatCard 
          title="Completed Courses"
          value={stats?.completedCourses || 0}
          icon={CheckCircle}
          iconColor="text-emerald-600"
          isLoading={statsLoading}
        />
        <StatCard 
          title="Hours Learned"
          value={stats?.hoursLearned || 0}
          icon={Clock}
          iconColor="text-amber-600"
          isLoading={statsLoading}
        />
        <StatCard 
          title="Certificates Earned"
          value={stats?.certificates || 0}
          icon={Trophy}
          iconColor="text-yellow-600"
          isLoading={statsLoading}
        />
      </div>

      {/* Continue Learning Section */}
      <div className="mb-8">
        <DashboardSectionHeader 
          title="Continue Learning"
          isLoading={coursesLoading}
          actionComponent={
            (enrolledCourses && enrolledCourses.length > 4) ? (
              <Link href="/courses?filter=enrolled">
                <Button variant="ghost">View all</Button>
              </Link>
            ) : null
          }
        />
        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
          </div>
        ) : continueLearningCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {continueLearningCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="flex">
                  <img
                    src={course.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=150&fit=crop"}
                    alt={course.title}
                    className="w-28 h-full object-cover sm:w-32"
                  />
                  <div className="flex-1 p-4">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-md sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          by {course.instructor.firstName} {course.instructor.lastName}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 sm:mr-3">
                            <div
                              className="bg-primary h-2 rounded-full progress-bar"
                              style={{ width: `${course.userProgress}%` }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {course.userProgress}%
                          </span>
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <Button size="sm" className="w-full sm:w-auto">Continue</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
           <EmptyState
            icon={BookOpen}
            title="Keep Learning"
            message="You haven't started any courses yet or have completed all enrolled courses. Explore new courses to continue your journey!"
            actionButton={{ text: "Explore Courses", href: "/courses" }}
          />
        )}
      </div>

      {/* Recommended for You Section */}
      <div className="mb-12">
         <DashboardSectionHeader 
          title="Recommended for You"
          isLoading={recommendedLoading}
          actionComponent={
            <Link href="/courses">
              <Button variant="ghost">View all</Button>
            </Link>
          }
        />
        {recommendedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4 sm:p-6">
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendedCourses && recommendedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
           <EmptyState
            icon={Award} // Using Award as a placeholder for recommendations
            title="No Recommendations Yet"
            message="We're still learning what you like! Explore more courses to get personalized recommendations."
             actionButton={{ text: "Explore Courses", href: "/courses" }}
          />
        )}
      </div>
      
      {/* My Certificates Section */}
      <div className="mb-12">
        <DashboardSectionHeader title="My Certificates" isLoading={certificatesLoading} />
        {certificatesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-24 mt-3" />
              </Card>
            ))}
          </div>
        ) : certificates && certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <Award className="h-10 w-10 text-yellow-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800">{cert.courseTitle}</h3>
                    <p className="text-sm text-gray-600">Instructor: {cert.instructorName}</p>
                    <p className="text-sm text-gray-500">Completed: {formatDate(cert.completionDate)}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild disabled={!cert.certificateUrl || cert.certificateUrl === '#'}>
                    <a href={cert.certificateUrl || '#'} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4"/> View
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No Certificates Yet"
            message="Complete courses to earn your certificates and showcase your achievements!"
            actionButton={{ text: "Explore Courses", href: "/courses" }}
          />
        )}
      </div>

      {/* Recent Activity Section */}
      <div>
        <DashboardSectionHeader title="Recent Activity" isLoading={activityLoading} />
        {activityLoading ? (
           <Card><CardContent className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </CardContent></Card>
        ) : recentActivity && recentActivity.length > 0 ? (
          <Card>
            <CardContent className="p-6 divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-opacity-10
                      ${activity.type === 'lesson' ? 'bg-blue-500 text-blue-600' : ''}
                      ${activity.type === 'quiz' ? 'bg-green-500 text-green-600' : ''}
                      ${activity.type === 'enrollment' ? 'bg-purple-500 text-purple-600' : ''}
                      ${activity.type === 'certificate' ? 'bg-yellow-500 text-yellow-600' : ''}
                    `}>
                      {activity.type === 'lesson' && <BookOpen className="h-5 w-5" />}
                      {activity.type === 'quiz' && <CheckCircle className="h-5 w-5" />}
                      {activity.type === 'enrollment' && <ActivityIcon className="h-5 w-5" />}
                      {activity.type === 'certificate' && <Award className="h-5 w-5" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    {activity.courseTitle && (
                      <p className="mt-0.5 text-sm text-gray-500">{activity.courseTitle}</p>
                    )}
                    <p className="mt-0.5 text-sm text-gray-500">{getTimeAgo(new Date(activity.timestamp))}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={ActivityIcon}
            title="No Recent Activity"
            message="Your recent activities will appear here as you progress through courses."
          />
        )}
      </div>
    </div>
  );
}
