
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Clock, Star } from "lucide-react";
import { CourseType } from "@/types/course";
import { getPlaceholderImage, formatDate } from "@/lib/utils";

interface CourseCardProps {
  course: CourseType;
  isAuthenticated: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isAuthenticated }) => {
  // Get consistent placeholder image based on course id
  const courseImage = course.image_url || getPlaceholderImage(course.id, 500, 300);

  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="overflow-hidden h-full transition-transform hover:shadow-md hover:-translate-y-1">
        <img 
          src={courseImage}
          alt={course.title}
          className="w-full h-40 object-cover"
          onError={(e) => {
            // If image fails to load, use a fallback
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=500&h=300&q=80";
          }}
        />
        <CardContent className="p-4">
          <h3 className="font-bold text-lg line-clamp-2 mb-2 font-nunito-sans">{course.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3 font-exo2">{course.description}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <BadgeCheck className="h-4 w-4 mr-1 text-green-500" />
            <span className="mr-3 font-exo2">{course.lessons ?? 0} lessons</span>
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-exo2">{course.modules || 0} hours</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={course.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.author?.name || 'Instructor')}`}
                alt={course.author?.name || "Instructor"}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-sm font-exo2">{course.author?.name || "Instructor"}</span>
            </div>
            {/* Only show rating if ratings data is available */}
            {course.rating !== undefined && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium font-exo2">{course.rating}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 text-xs text-gray-500 font-exo2">
            Updated: {formatDate(course.updated_at || new Date())}
          </div>
          
          {isAuthenticated && (
            <Button className="w-full mt-3" variant="outline" size="sm">View Course</Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
