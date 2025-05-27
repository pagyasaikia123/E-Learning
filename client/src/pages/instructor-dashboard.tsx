import { useState, useMemo, useEffect } from "react";
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
  Award,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Reusable Components
import StatCard from "@/components/StatCard"; 
import DashboardSectionHeader from "@/components/DashboardSectionHeader";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../contexts/AuthContext";
import { Redirect } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatRating, getCategoryColor } from "@/lib/utils"; // Assuming these utils are available
import type { CourseWithInstructor, InsertCourse, User } from "@shared/schema";
// Note: CourseCard is imported if used explicitly, but often it's part of a map
import type { CourseWithInstructor, InsertCourse, User } from "@shared/schema"; // Already here

// Categories and Levels remain the same
const categories = [
  "Technology", "Design", "Business", "Creative", "Marketing", "Science", "Health", "Music"
];
const levels = ["Beginner", "Intermediate", "Advanced"];
type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

// Analytics Data Types
interface RevenueDataItem {
  date: string; // Or month string e.g., "Jan"
  revenue: number;
}
interface RevenueAnalytics {
  period: string;
  data: RevenueDataItem[];
  totalRevenue?: number; // Optional: if backend provides total, or calculate on client
}

interface TopCourseAnalytics {
  id: number;
  title: string;
  metric: number; // Could be revenue or students
  students?: number; // If metric is revenue, students can be separate
  rating?: number; // If available
}

interface EngagementAnalytics {
  averageCompletionRate: number;
  averageQuizScore?: number; // Optional as per mock
  totalHoursLearned?: number; // Added based on student dashboard
  activeStudents: number;
}


export default function InstructorDashboard() {
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading } = useAuth();
  
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithInstructor | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CourseWithInstructor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [formValues, setFormValues] = useState<Partial<InsertCourse & {id?: number}>>({});

  useEffect(() => {
    if (editingCourse) {
      setFormValues({
        id: editingCourse.id,
        title: editingCourse.title,
        description: editingCourse.description,
        category: editingCourse.category,
        level: editingCourse.level,
        price: editingCourse.price / 100,
        thumbnail: editingCourse.thumbnail || '',
        duration: editingCourse.duration || 0,
        instructorId: editingCourse.instructorId,
      });
    } else {
      setFormValues({ instructorId: authUser?.id });
    }
  }, [editingCourse, showCourseDialog, authUser]);

  const instructorId = authUser?.id;

  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useQuery<CourseWithInstructor[]>({
    queryKey: [`/api/instructors/${instructorId}/courses`],
    enabled: !!instructorId,
  });

  const createCourseMutation = useMutation({
    mutationFn: (courseData: InsertCourse) =>
      apiRequest<{ course: CourseWithInstructor }>('POST', '/api/courses', courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/instructors/${instructorId}/courses`] });
      setShowCourseDialog(false); setEditingCourse(null);
      toast({ title: "Course created successfully!", description: "Your new course is ready." });
    },
    onError: (error: any) => toast({ title: "Failed to create course", description: error.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  
  const updateCourseMutation = useMutation({
    mutationFn: (courseData: Partial<InsertCourse> & { id: number }) =>
      apiRequest<{ course: CourseWithInstructor }>('PUT', `/api/courses/${courseData.id}`, { ...courseData, id: undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/instructors/${instructorId}/courses`] });
      setShowCourseDialog(false); setEditingCourse(null);
      toast({ title: "Course updated successfully!" });
    },
    onError: (error: any) => toast({ title: "Failed to update course", description: error.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: number) => apiRequest('DELETE', `/api/courses/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/instructors/${instructorId}/courses`] });
      setCourseToDelete(null);
      toast({ title: "Course deleted successfully!" });
    },
    onError: (error: any) => toast({ title: "Failed to delete course", description: error.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  const handleDialogSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authUser?.id) {
      toast({ title: "Authentication error", description: "User not found.", variant: "destructive" }); return;
    }
    const coursePayload: InsertCourse = {
      title: formValues.title || '', description: formValues.description || '',
      instructorId: authUser.id, category: formValues.category || '', level: formValues.level || '',
      price: Math.round(Number(formValues.price || 0) * 100),
      thumbnail: formValues.thumbnail || undefined, duration: Number(formValues.duration || 0),
    };
    if (editingCourse) updateCourseMutation.mutate({ ...coursePayload, id: editingCourse.id });
    else createCourseMutation.mutate(coursePayload);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLSelectElement) return; 
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (name: string, value: string) => setFormValues(prev => ({ ...prev, [name]: value }));
  const openEditDialog = (course: CourseWithInstructor) => { setEditingCourse(course); setShowCourseDialog(true); };
  const openCreateDialog = () => { setEditingCourse(null); setShowCourseDialog(true); };

  const filteredAndSortedCourses = useMemo(() => {
    let courses = coursesData || [];
    if (searchTerm) courses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    switch (sortOption) {
      case "oldest": courses.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "title-asc": courses.sort((a,b) => a.title.localeCompare(b.title)); break;
      case "title-desc": courses.sort((a,b) => b.title.localeCompare(a.title)); break;
      default: courses.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return courses;
  }, [coursesData, searchTerm, sortOption]);

  const totalStudents = coursesData?.reduce((s, c) => s + c.enrollmentCount, 0) || 0;
  const totalRevenue = coursesData?.reduce((s, c) => s + (c.enrollmentCount * c.price), 0) || 0;
  const averageRating = coursesData?.length ? coursesData.reduce((s, c) => s + (c.rating || 0), 0) / coursesData.length / 10 : 0;

  // Analytics Queries
  const { 
    data: revenueData, 
    isLoading: revenueLoading, 
    error: revenueError 
  } = useQuery<RevenueAnalytics>({
    queryKey: [`/api/instructors/${instructorId}/analytics/revenue`, { period: 'monthly' }],
    queryFn: () => apiRequest('GET', `/api/instructors/${instructorId}/analytics/revenue?period=monthly`),
    enabled: !!instructorId,
  });

  const { 
    data: topCoursesData, 
    isLoading: topCoursesLoading, 
    error: topCoursesError 
  } = useQuery<TopCourseAnalytics[]>({
    queryKey: [`/api/instructors/${instructorId}/analytics/top-courses`, { sortBy: 'revenue' }],
    queryFn: () => apiRequest('GET', `/api/instructors/${instructorId}/analytics/top-courses?sortBy=revenue`),
    enabled: !!instructorId,
  });

  const { 
    data: engagementData, 
    isLoading: engagementLoading, 
    error: engagementError 
  } = useQuery<EngagementAnalytics>({
    queryKey: [`/api/instructors/${instructorId}/analytics/engagement`],
    queryFn: () => apiRequest('GET', `/api/instructors/${instructorId}/analytics/engagement`),
    enabled: !!instructorId,
  });


  if (authLoading || coursesLoading) { // Keep initial global loading for essential data
    return ( 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => <StatCard key={i} title="" value="" icon={BookOpen} isLoading={true} />)}
        </div>
        <DashboardSectionHeader title="" isLoading={true} actionComponent={<Skeleton className="h-10 w-32" />} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!authUser || authUser.role !== 'instructor') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
         <EmptyState 
          icon={Users}
          title="Access Denied"
          message="You are not authorized to view this page. Please log in as an instructor."
          actionButton={{ text: "Go to Login", href: "/login" }}
        />
      </div>
    );
  }
  
  if (coursesError) {
    return <div className="text-red-500 p-4">Error loading courses: {coursesError.message}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardSectionHeader 
        title={`Instructor Dashboard`}
        actionComponent={
          <Dialog open={showCourseDialog} onOpenChange={(isOpen) => { setShowCourseDialog(isOpen); if (!isOpen) setEditingCourse(null); }}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" />Create Course</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
                <DialogDescription>{editingCourse ? "Update course details." : "Fill in new course details."}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDialogSubmit} className="space-y-6 pt-4">
                {/* Form fields remain the same, ensure value and onChange are correctly bound to formValues and handlers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input id="title" name="title" placeholder="Enter course title" value={formValues.title || ''} onChange={handleInputChange} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe what students will learn" rows={3} value={formValues.description || ''} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" value={formValues.category || ''} onValueChange={(value) => handleSelectChange('category', value)} required>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select name="level" value={formValues.level || ''} onValueChange={(value) => handleSelectChange('level', value)} required>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>{levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" name="price" type="number" min="0" step="0.01" placeholder="0.00" value={formValues.price === undefined ? '' : String(formValues.price)} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input id="duration" name="duration" type="number" min="0" placeholder="0" value={formValues.duration === undefined ? '' : String(formValues.duration)} onChange={handleInputChange}/>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                  <Input id="thumbnail" name="thumbnail" type="url" placeholder="https://example.com/image.jpg" value={formValues.thumbnail || ''} onChange={handleInputChange}/>
                </div>
              </div>
                <DialogFooter className="pt-4">
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit" disabled={createCourseMutation.isPending || updateCourseMutation.isPending}>
                    {editingCourse ? (updateCourseMutation.isPending ? "Saving..." : "Save Changes") : (createCourseMutation.isPending ? "Creating..." : "Create Course")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <p className="mt-1 text-lg text-gray-600 mb-8">Manage your courses and track your success, {authUser.firstName}!</p>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Courses" value={coursesData?.length || 0} icon={BookOpen} isLoading={coursesLoading} iconColor="text-primary" />
        <StatCard title="Total Students" value={totalStudents} icon={Users} isLoading={coursesLoading} iconColor="text-emerald-600" />
        <StatCard title="Total Revenue" value={formatPrice(totalRevenue)} icon={DollarSign} isLoading={coursesLoading} iconColor="text-green-600" />
        <StatCard title="Avg. Rating" value={averageRating.toFixed(1)} icon={Star} isLoading={coursesLoading} iconColor="text-yellow-600" />
      </div>

      {/* Course Management */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Filter courses by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Creation Date (Newest)</SelectItem>
                <SelectItem value="oldest">Creation Date (Oldest)</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredAndSortedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  <div className="aspect-video relative">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 sm:p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(course.category)}>
                          {course.category}
                        </Badge>
                        <span className="text-xs sm:text-sm text-gray-500">{course.level}</span>
                      </div>

                      <h3 className="text-md sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
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

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(course)}>
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setLocation(`/instructor/courses/${course.id}/content`)}>
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Manage Content
                        </Button>
                      </div>
                      <div className="pt-2">
                        <AlertDialogTrigger asChild>
                            <Button variant="destructiveOutline" size="sm" className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => setCourseToDelete(course)}>
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Delete Course
                            </Button>
                          </AlertDialogTrigger>
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
                    {searchTerm ? "No courses match your filter" : "No courses yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? "Try adjusting your search terms." : "Create your first course to start teaching and earning."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={openCreateDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Course
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Delete Course Confirmation Dialog */}
          <AlertDialog open={!!courseToDelete} onOpenChange={(isOpen) => !isOpen && setCourseToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the course
                  "{courseToDelete?.title}" and all of its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCourseToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    if (courseToDelete) deleteCourseMutation.mutate(courseToDelete.id);
                  }}
                  disabled={deleteCourseMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteCourseMutation.isPending ? "Deleting..." : "Yes, delete course"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Overview
                </CardTitle>
                 <CardDescription>Monthly revenue breakdown and total earnings.</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : revenueError ? (
                  <EmptyState title="Error" message={(revenueError as Error).message || "Could not load revenue data."} />
                ) : revenueData ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {formatPrice(revenueData.totalRevenue || revenueData.data.reduce((sum, item) => sum + item.revenue, 0))}
                      </div>
                      <p className="text-sm text-gray-600">Total Revenue ({revenueData.period})</p>
                    </div>
                    <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                      {revenueData.data.map((item, index) => {
                        const maxRevenue = Math.max(...revenueData.data.map(d => d.revenue), 1); // Avoid division by zero
                        const barWidth = `${(item.revenue / maxRevenue) * 100}%`;
                        return (
                          <div key={index}>
                            <div className="flex justify-between text-sm text-gray-700">
                              <span>{item.date}</span>
                              <span>{formatPrice(item.revenue)}</span>
                            </div>
                            <div className="h-2 bg-primary/20 rounded-full mt-1">
                              <div style={{ width: barWidth }} className="h-2 bg-primary rounded-full"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                   <EmptyState title="No Revenue Data" message="Revenue data is not yet available." />
                )}
              </CardContent>
            </Card>

            {/* Top Performing Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Courses
                </CardTitle>
                <CardDescription>Your most popular or highest-earning courses.</CardDescription>
              </CardHeader>
              <CardContent>
                {topCoursesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                       <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : topCoursesError ? (
                  <EmptyState title="Error" message={(topCoursesError as Error).message || "Could not load top courses."} />
                ) : topCoursesData && topCoursesData.length > 0 ? (
                  <div className="space-y-4">
                    {topCoursesData.slice(0, 5).map((course, index) => (
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
                            {course.students !== undefined && <span>{course.students} students</span>}
                            {course.students !== undefined && course.rating !== undefined && <span>•</span>}
                            {course.rating !== undefined && <span>{course.rating.toFixed(1)} rating</span>}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {/* Assuming metric is revenue, otherwise display based on sortBy */}
                          {formatPrice(course.metric)} 
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No Top Courses" message="Data for top courses is not yet available." />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
               <CardDescription>Overview of student interaction and progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8 h-48 flex flex-col items-center justify-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Detailed student engagement metrics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
