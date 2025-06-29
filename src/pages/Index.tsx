
import React from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/home/Hero";
import CourseCategories from "@/components/home/CourseCategories";
import Testimonials from "@/components/home/Testimonials";
import Features from "@/components/home/Features";
import VersionFeatures from "@/components/version/VersionFeatures";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Version 2.0 Features */}
      <VersionFeatures />
      
      {/* Course Categories */}
      <CourseCategories />
      
      {/* Features Section */}
      <Features />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-medblue-600 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 font-heading"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ready to Transform Your Medical Education?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of medical students and professionals who've achieved their goals with MedMaster.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-white text-medblue-600 hover:bg-blue-50 text-lg px-8 py-6"
              asChild
            >
              <Link to="/signup">Start Your Free 7-Day Trial</Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
