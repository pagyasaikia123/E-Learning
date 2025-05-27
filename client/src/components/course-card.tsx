import { Star, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { formatPrice, formatRating, getCategoryColor, getLevelColor, generateStars } from "@/lib/utils";
import type { CourseWithInstructor } from "@shared/schema";

interface CourseCardProps {
  course: CourseWithInstructor;
  showProgress?: boolean;
}

export default function CourseCard({ course, showProgress = false }: CourseCardProps) {
  const stars = generateStars(course.rating || 0);

  return (
    <Card className="course-card-hover overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {showProgress && course.userProgress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
            <div className="flex items-center justify-between text-white text-sm mb-1">
              <span>Progress</span>
              <span>{course.userProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full progress-bar"
                style={{ width: `${course.userProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={getCategoryColor(course.category)}>
            {course.category}
          </Badge>
          <span className={`text-sm ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span>by {course.instructor.firstName} {course.instructor.lastName}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="flex text-yellow-400 mr-1">
                {stars.map((star, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      star === 'full' ? 'fill-current' : star === 'half' ? 'fill-current opacity-50' : ''
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {formatRating(course.rating || 0)} ({course.enrollmentCount})
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{Math.round(course.duration / 60)}h</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(course.price)}
          </span>
          
          {showProgress && course.isEnrolled ? (
            <Link href={`/courses/${course.id}`}>
              <Button>Continue Learning</Button>
            </Link>
          ) : (
            <Link href={`/courses/${course.id}`}>
              <Button>
                {course.isEnrolled ? "View Course" : "Enroll Now"}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
