
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Clock, Star } from "lucide-react";
import { CourseType } from "@/types/course";

interface FeaturedCourseCardProps {
  course: CourseType;
  isAuthenticated: boolean;
}

export const FeaturedCourseCard: React.FC<FeaturedCourseCardProps> = ({ course, isAuthenticated }) => {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="overflow-hidden h-full transition-transform hover:shadow-lg hover:-translate-y-1">
        <div className="relative">
          <img 
            src={course.image_url || `https://picsum.photos/500/300?random=${course.id}`}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium font-exo2">
            Featured
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-bold text-lg line-clamp-2 mb-2 font-nunito-sans">{course.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4 font-exo2">{course.description}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <BadgeCheck className="h-4 w-4 mr-1 text-green-500" />
            <span className="mr-4 font-exo2">{course.lectures || 0} lessons</span>
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-exo2">{course.modules || 0} hours</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={course.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.author?.name || 'Instructor')}`}
                alt={course.author?.name || "Instructor"}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="text-sm font-exo2">{course.author?.name || "Instructor"}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium font-exo2">4.8</span>
            </div>
          </div>
          
          {isAuthenticated && (
            <Button className="w-full mt-4">Enroll Now</Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
