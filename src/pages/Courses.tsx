
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Filter, BookOpen, BadgeCheck, Clock, Star } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useCourses } from "@/hooks/use-courses";
import { useAuth } from "@/context/AuthContext";
import { CourseType } from "@/types/course";
import { CourseCard } from "@/components/courses/CourseCard";
import { FeaturedCourseCard } from "@/components/courses/FeaturedCourseCard";

const CoursesPage = () => {
  const { courses, isLoading, fetchCourses } = useCourses();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Courses" },
    { id: "anatomy", name: "Anatomy" },
    { id: "physiology", name: "Physiology" },
    { id: "pathology", name: "Pathology" },
    { id: "pharmacology", name: "Pharmacology" },
    { id: "clinical", name: "Clinical Skills" },
    { id: "other", name: "Other" },
  ];

  // Refresh course list on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Sample featured courses (the most recently added courses)
  const featuredCourses = courses.slice(0, 3);

  // Filter courses based on search query and active category
  useEffect(() => {
    if (!courses) return;
    
    let filtered = [...courses];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        (course.description && course.description.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(course => 
        course.category === activeCategory
      );
    }
    
    setFilteredCourses(filtered);
  }, [searchQuery, activeCategory, courses]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-nunito-sans">Explore Courses</h1>
          <p className="text-gray-600 max-w-3xl font-exo2">
            Discover our comprehensive library of medical courses designed for students, 
            residents, and healthcare professionals at all levels of training.
          </p>
          
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search for courses..." 
                className="pl-10 pr-4 py-2 rounded-lg font-exo2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-exo2">Filters</span>
            </Button>
          </div>
        </motion.div>
        
        <div className="mb-12">
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="overflow-x-auto flex whitespace-nowrap pb-2 mb-6">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="px-4 py-2 rounded-full font-exo2"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medblue-600"></div>
          </div>
        ) : (
          <>
            {featuredCourses.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-nunito-sans">Featured Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredCourses.map((course) => (
                    <FeaturedCourseCard key={course.id} course={course} isAuthenticated={isAuthenticated} />
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-nunito-sans">All Courses</h2>
              
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium font-nunito-sans">No courses found</h3>
                  <p className="mt-2 text-gray-500 font-exo2">
                    {searchQuery 
                      ? `No courses matching "${searchQuery}"`
                      : "No courses available in this category right now"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} isAuthenticated={isAuthenticated} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
