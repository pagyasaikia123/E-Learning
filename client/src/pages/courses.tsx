import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import CourseCard from "@/components/course-card";
import type { CourseWithInstructor } from "@shared/schema";

const categories = [
  { value: "", label: "All Categories" },
  { value: "Technology", label: "Technology" },
  { value: "Design", label: "Design" },
  { value: "Business", label: "Business" },
  { value: "Creative", label: "Creative" },
  { value: "Marketing", label: "Marketing" },
];

const levels = [
  { value: "", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

// Mock user ID - in a real app this would come from auth context
const CURRENT_USER_ID = 3;

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);

  const { data: courses, isLoading } = useQuery<CourseWithInstructor[]>({
    queryKey: ['/api/courses', { 
      limit: 12, 
      offset: 0, 
      category: selectedCategory || undefined,
      search: searchQuery || undefined 
    }],
  });

  const { data: enrolledCourses } = useQuery<CourseWithInstructor[]>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/enrollments`],
    enabled: showEnrolledOnly,
  });

  const filteredCourses = (() => {
    let coursesToShow = showEnrolledOnly ? enrolledCourses : courses;
    
    if (!coursesToShow) return [];
    
    if (selectedLevel) {
      coursesToShow = coursesToShow.filter(course => course.level === selectedLevel);
    }
    
    return coursesToShow;
  })();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query key update
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {showEnrolledOnly ? "My Courses" : "Browse Courses"}
        </h1>
        <p className="text-lg text-gray-600">
          {showEnrolledOnly 
            ? "Continue your learning journey" 
            : "Discover new skills and advance your career"
          }
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Toggle between all courses and enrolled courses */}
          <Button
            variant={showEnrolledOnly ? "default" : "outline"}
            onClick={() => setShowEnrolledOnly(!showEnrolledOnly)}
            className="whitespace-nowrap"
          >
            {showEnrolledOnly ? "All Courses" : "My Courses"}
          </Button>
        </div>

        {/* Active Filters */}
        {(selectedCategory || selectedLevel || searchQuery) && (
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCategory("")}
              >
                {categories.find(c => c.value === selectedCategory)?.label} ×
              </Button>
            )}
            {selectedLevel && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedLevel("")}
              >
                {levels.find(l => l.value === selectedLevel)?.label} ×
              </Button>
            )}
            {searchQuery && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                "{searchQuery}" ×
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory("");
                setSelectedLevel("");
                setSearchQuery("");
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all courses.
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setSelectedLevel("");
              setShowEnrolledOnly(false);
            }}
          >
            Browse All Courses
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showProgress={showEnrolledOnly}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredCourses.length > 0 && filteredCourses.length % 12 === 0 && (
        <div className="text-center mt-8">
          <Button variant="outline">Load More Courses</Button>
        </div>
      )}
    </div>
  );
}
