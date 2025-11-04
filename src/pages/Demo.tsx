
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/video/VideoPlayer";
import { Check, ArrowRight, Download } from "lucide-react";

const Demo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-medblue-50 to-white py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Experience Verovian LMS in Action
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how our interactive learning platform can transform your educational experience
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="aspect-video w-full bg-white rounded-xl overflow-hidden shadow-lg border border-slate-100">
                <VideoPlayer 
                  src="" 
                  title="Verovian LMS Platform Demo"
                />
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Features Highlight */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Experience Our Key Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See why thousands of students choose Verovian LMS for their education
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="bg-slate-50 rounded-xl overflow-hidden mb-6">
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="default" className="bg-medblue-600" size="lg">
                        <span>Play Demo</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Video Lessons</h3>
                <p className="text-gray-600 mb-4">
                  Our engaging video lessons break down complex concepts with clear explanations, animations, and practical correlations.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>High-yield content from expert educators</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Bookmark important sections</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Take notes while watching</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-slate-50 rounded-xl overflow-hidden mb-6">
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="default" className="bg-medblue-600" size="lg">
                        <span>Play Demo</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Flashcards</h3>
                <p className="text-gray-600 mb-4">
                  Our spaced repetition system adapts to your performance, helping you focus on what you need to learn most.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Personalized study schedule</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Performance analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Create your own custom decks</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="bg-slate-50 rounded-xl overflow-hidden mb-6">
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="default" className="bg-medblue-600" size="lg">
                        <span>Play Demo</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Practice Question Bank</h3>
                <p className="text-gray-600 mb-4">
                  Test your knowledge with thousands of board-style practice questions with detailed explanations.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Standardized exam style questions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Detailed answer explanations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Custom quiz creation</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-slate-50 rounded-xl overflow-hidden mb-6">
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="default" className="bg-medblue-600" size="lg">
                        <span>Play Demo</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Progress Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Track your study habits, test performance, and progress with detailed analytics.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Visual progress reports</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Strength and weakness analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Study time optimization</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Full Product Tour CTA */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-medblue-600 text-white rounded-xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Want to see more?</h2>
                  <p className="text-blue-100">
                    Schedule a personal demo with one of our education specialists
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-white text-medblue-600 hover:bg-blue-50" size="lg" asChild>
                    <Link to="/contact">Schedule a Demo</Link>
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-medblue-500" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download Brochure</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Testimonial */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <div className="w-16 h-1 bg-medblue-600 mx-auto"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 md:p-12"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" 
                    alt="User testimonial" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xl text-gray-600 italic mb-6">
                  "Verovian LMS transformed my study habits and helped me excel in my exams. The integrated approach of videos, quizzes, and flashcards was exactly what I needed to master complex concepts."
                </p>
                <h3 className="font-bold text-gray-900 mb-1">Dr. Michael Chen</h3>
                <p className="text-gray-600">Graduate Student, UCLA</p>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-20 px-4 bg-medblue-600 text-white">
          <div className="container mx-auto max-w-5xl text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Ready to Transform Your Learning Experience?
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of students and professionals who've achieved their goals with Verovian LMS.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button 
                size="lg" 
                className="bg-white text-medblue-600 hover:bg-blue-50 text-lg px-8"
                asChild
              >
                <Link to="/signup">Start Your Free 7-Day Trial</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-medblue-500 text-lg"
                asChild
              >
                <Link to="/courses">
                  Browse Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Demo;
