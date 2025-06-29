
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, BookOpen } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const isCourseRelated = location.pathname.includes("/courses/");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-medblue-600 mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Oops! Page not found</h2>
        
        <p className="text-gray-600 mb-8">
          {isCourseRelated 
            ? "The course you're looking for might have been moved, deleted, or doesn't exist yet."
            : "The page you're looking for might have been moved or doesn't exist."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-medblue-600 hover:bg-medblue-700">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>
          </Button>
          
          {isCourseRelated && (
            <Button asChild variant="outline">
              <Link to="/courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Browse Courses</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
