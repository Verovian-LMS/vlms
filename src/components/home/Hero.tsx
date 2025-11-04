
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-medblue-50 via-white to-medteal-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="lg:w-1/2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Master Learning with <span className="text-medblue-600">Interactive</span> Learning
            </h1>
            <p className="text-lg text-gray-700 md:text-xl max-w-xl">
              High-yield video lessons, interactive quizzes, and AI-powered flashcards to help you ace your exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                className="bg-medblue-600 hover:bg-medblue-700 text-lg py-6 animate-pulse-glow"
                size="lg"
                asChild
              >
                <Link to="/signup" className="flex items-center space-x-2">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-300 text-gray-700 py-6"
                asChild
              >
                <Link to="/demo" className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-medblue-500 to-medteal-500 rounded-xl blur-md opacity-60"></div>
              <div className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  {/* This would be a video or image preview */}
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-medblue-600 text-white flex items-center justify-center mx-auto mb-4">
                      <Play className="w-6 h-6" />
                    </div>
                    <p className="text-gray-500">Video Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
