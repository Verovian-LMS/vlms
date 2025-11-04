
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X,
  LogIn,
  UserPlus,
  BookOpen,
  BarChart4,
  GraduationCap,
  User,
  LogOut,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/FastApiAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false); // Close mobile menu if open
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Check if user is a creator
  const isCreator = profile?.role === 'creator';

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-medblue-600" />
              <span className="text-xl font-bold text-medblue-900">EduMaster</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/about">About Us</NavLink>
            <div className="flex items-center space-x-3">
              {isAuthenticated && profile ? (
                <>
                  {/* Only show Course Upload for creators */}
                  {isCreator && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/course-upload" className="flex items-center space-x-1">
                        <PlusCircle className="w-4 h-4" />
                        <span>Create Course</span>
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profile" className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                        <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span>{profile.name}</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <div className="flex items-center space-x-1">
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </div>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login" className="flex items-center space-x-1">
                      <LogIn className="w-4 h-4" />
                      <span>Log In</span>
                    </Link>
                  </Button>
                  <Button className="bg-medblue-600 hover:bg-medblue-700" size="sm" asChild>
                    <Link to="/signup" className="flex items-center space-x-1">
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn(
        "md:hidden fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <GraduationCap className="w-8 h-8 text-medblue-600" />
              <span className="text-xl font-bold text-medblue-900">EduMaster</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>
          <nav className="flex flex-col space-y-4">
            <MobileNavLink href="/courses" icon={<BookOpen className="w-5 h-5" />} onClick={() => setIsOpen(false)}>Courses</MobileNavLink>
            <MobileNavLink href="/pricing" icon={<BarChart4 className="w-5 h-5" />} onClick={() => setIsOpen(false)}>Pricing</MobileNavLink>
            <MobileNavLink href="/about" icon={<BookOpen className="w-5 h-5" />} onClick={() => setIsOpen(false)}>About Us</MobileNavLink>
            {isAuthenticated && profile && (
              <>
                {/* Only show Course Upload for creators in mobile view */}
                {isCreator && (
                  <MobileNavLink 
                    href="/course-upload" 
                    icon={<PlusCircle className="w-5 h-5" />} 
                    onClick={() => setIsOpen(false)}
                  >
                    Create Course
                  </MobileNavLink>
                )}
                <MobileNavLink href="/profile" icon={<User className="w-5 h-5" />} onClick={() => setIsOpen(false)}>Profile</MobileNavLink>
              </>
            )}
          </nav>
          <div className="mt-auto pt-8 flex flex-col space-y-3">
            {isAuthenticated && profile ? (
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-2"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login" className="w-full flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
                    <LogIn className="w-5 h-5" />
                    <span>Log In</span>
                  </Link>
                </Button>
                <Button className="bg-medblue-600 hover:bg-medblue-700 w-full" asChild>
                  <Link to="/signup" className="flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
                    <UserPlus className="w-5 h-5" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link 
    to={href} 
    className="text-gray-700 hover:text-medblue-600 font-medium transition-colors duration-200"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ 
  href, 
  icon, 
  children, 
  onClick 
}: { 
  href: string, 
  icon: React.ReactNode, 
  children: React.ReactNode,
  onClick?: () => void 
}) => (
  <Link 
    to={href} 
    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
    onClick={onClick}
  >
    <div className="text-medblue-600">{icon}</div>
    <span className="text-gray-700 font-medium">{children}</span>
  </Link>
);

export default Navigation;
