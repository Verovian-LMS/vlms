
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/FastApiAuthContext";
import SignupForm from "@/components/auth/SignupForm";
import SocialSignup from "@/components/auth/SocialSignup";

const Signup = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center space-x-2 mb-8">
        <GraduationCap className="w-10 h-10 text-medblue-600" />
        <span className="text-2xl font-bold text-medblue-900">Verovian LMS</span>
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialSignup />
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <SignupForm />
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-medblue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        By signing up, you agree to our{" "}
        <Link to="/terms" className="text-medblue-600 font-medium hover:underline">
          Terms of Service
        </Link>
        {" "}and{" "}
        <Link to="/privacy" className="text-medblue-600 font-medium hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
};

export default Signup;
