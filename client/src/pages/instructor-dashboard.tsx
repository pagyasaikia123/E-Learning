import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Star, 
  DollarSign,
  TrendingUp,
  BookOpen,
  Play,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatRating, getCategoryColor } from "@/lib/utils";
import type { CourseWithInstructor, InsertCourse } from "@shared/schema";

// Mock instructor ID - in a real app this would come from auth context
const CURRENT_INSTRUCTOR_ID = 1;

const categories = [
  "Technology",
  "Design", 
  "Business",
  "Creative",
  "Marketing",
  "Science"
];

const levels = [
  "Beginner",
  "Intermediate", 
  "Advanced"
];

export default function InstructorDashboard() {
  const { toast } = useToast();
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithInstructor | null>(null);

  const { data: courses, isLoading } = useQuery<CourseWithInstructor[]>({
    queryKey: [`/api/instructors/${CURRENT_INSTRUCTOR_ID}/courses`],
  });

  const createCourseMutation = useMutation({
    mutationFn: (courseData: InsertCourse) =>
      apiRequest('POST', '/api/courses', courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/instructors/${CURRENT_INSTRUCTOR_ID}/courses`] 
      });
      setShowCreateCourse(false);
      toast({
        title: "Course created successfully!",
        description: "Your new course has been created and is ready for content.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateCourse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const courseData: InsertCourse = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      instructorId: CURRENT_INSTRUCTOR_ID,
      category: formData.get('category') as string,
      level: formData.get('level') as string,
      price: parseInt(formData.get('price') as string) * 100, // Convert to cents
      thumbnail: formData.get('thumbnail') as string || undefined,
      duration: parseInt(formData.get('duration') as string) || 0,
    };

    createCourseMutation.mutate(courseData);
  };

  // Calculate stats
  const totalStudents = courses?.reduce((sum, course) => sum + course.enrollmentCount, 0) || 0;
  const totalRevenue = courses?.reduce((sum, course) => sum + (course.enrollmentCount * course.price), 0) || 0;
  const averageRating = courses?.length 
    ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length / 10
    : 0;

  if (isLoading) {
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
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="mt-1 text-lg text-gray-600">Manage your courses and track your success</p>
        </div>
        
        <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what students will learn"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select name="level" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                  <Input
                    id="thumbnail"
                    name="thumbnail"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateCourse(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCourseMutation.isPending}>
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                    Total Courses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {courses?.length || 0}
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
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalStudents}
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
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatPrice(totalRevenue)}
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
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rating
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {averageRating.toFixed(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Management */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-video relative">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(course.category)}>
                        {course.category}
                      </Badge>
                      <span className="text-sm text-gray-500">{course.level}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{course.enrollmentCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>{formatRating(course.rating || 0)}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(course.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Play className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first course to start teaching and earning.
                  </p>
                  <Button onClick={() => setShowCreateCourse(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatPrice(totalRevenue)}
                    </div>
                    <p className="text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center text-gray-500">
                    <p>Detailed analytics coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses?.slice(0, 3).map((course, index) => (
                    <div key={course.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {course.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{course.enrollmentCount} students</span>
                          <span>•</span>
                          <span>{formatRating(course.rating || 0)} rating</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(course.enrollmentCount * course.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Detailed engagement metrics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
