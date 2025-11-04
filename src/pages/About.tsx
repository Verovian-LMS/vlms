
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Award, Users, BookOpen, GraduationCap, Globe, Heart, ArrowRight } from "lucide-react";

// Team members data
const teamMembers = [
  {
    name: "Dr. Sarah Johnson",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
    bio: "Educational leader and former university professor with a passion for accessible education."
  },
  {
    name: "Dr. Michael Chang",
    role: "Chief Academic Officer",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
    bio: "Academic professional with 15+ years of educational experience and a focus on student-centered learning."
  },
  {
    name: "Emma Rodriguez",
    role: "Chief Product Officer",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    bio: "EdTech expert with a background in instructional design and learning sciences."
  },
  {
    name: "James Wilson",
    role: "Chief Technology Officer",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857",
    bio: "Software engineer specializing in educational platforms and AI-driven learning."
  }
];

// Stats data
const stats = [
  { label: "Students", value: "50,000+", icon: <Users className="h-8 w-8 text-medblue-600" /> },
  { label: "Video Lessons", value: "2,500+", icon: <BookOpen className="h-8 w-8 text-medteal-600" /> },
  { label: "Institutions", value: "120+", icon: <GraduationCap className="h-8 w-8 text-medblue-600" /> },
  { label: "Countries", value: "85+", icon: <Globe className="h-8 w-8 text-medteal-600" /> }
];

// Values data
const values = [
  {
    icon: <Award className="h-8 w-8 text-medblue-600" />,
    title: "Excellence",
    description: "We maintain the highest standards in education, ensuring accuracy and relevance."
  },
  {
    icon: <Heart className="h-8 w-8 text-medteal-600" />,
    title: "Accessibility",
    description: "We believe quality education should be accessible to students worldwide."
  },
  {
    icon: <Users className="h-8 w-8 text-medblue-600" />,
    title: "Community",
    description: "We foster a supportive learning environment where students can collaborate and grow."
  },
  {
    icon: <BookOpen className="h-8 w-8 text-medteal-600" />,
    title: "Innovation",
    description: "We continuously improve our platform with the latest educational technologies."
  }
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-medblue-50 via-white to-medteal-50 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  Transforming Education for the Digital Age
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  EduMaster was founded by educators and technology experts with a shared mission: to make high-quality education accessible, engaging, and effective.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-medblue-600 hover:bg-medblue-700" size="lg" asChild>
                    <Link to="/courses">Explore Our Courses</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/team">Meet Our Team</Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-medblue-500 to-medteal-500 rounded-xl blur-md opacity-60"></div>
                <div className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" 
                    alt="Students learning" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Story Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
              <div className="w-16 h-1 bg-medblue-600 mx-auto mb-8"></div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
                  alt="Our story" 
                  className="rounded-xl shadow-lg"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">From Classroom to Global Platform</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    EduMaster began in 2018 when Dr. Sarah Johnson, an education professor, noticed her students struggling with complex concepts. She started recording video explanations that broke down difficult topics in a clear, concise way.
                  </p>
                  <p>
                    These videos quickly became popular beyond her own classroom, spreading to universities across the country. Recognizing the need for accessible, high-quality educational resources, Dr. Johnson teamed up with educational technology experts to create EduMaster.
                  </p>
                  <p>
                    What started as supplementary videos for a single university class has now grown into a comprehensive learning platform serving students and professionals in over 85 countries.
                  </p>
                  <p>
                    Today, our team includes educators across multiple disciplines, instructional designers, software engineers, and learning scientists—all dedicated to our mission of transforming education.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center"
                >
                  <div className="flex justify-center mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <div className="w-16 h-1 bg-medblue-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These principles guide everything we do at EduMaster, from course development to platform design.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center"
                >
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Leadership Team</h2>
              <div className="w-16 h-1 bg-medblue-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our diverse team combines expertise in medicine, education, and technology.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-medblue-600 font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                    <div className="flex justify-center space-x-3">
                      <a href="#" className="text-gray-400 hover:text-medblue-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.162 5.656a8.384 8.384 0 01-2.402.658A4.196 4.196 0 0021.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 00-7.126 3.814 11.874 11.874 0 01-8.62-4.37 4.168 4.168 0 00-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 01-1.894-.523v.052a4.185 4.185 0 003.355 4.101 4.21 4.21 0 01-1.89.072A4.185 4.185 0 007.97 16.65a8.394 8.394 0 01-6.191 1.732 11.83 11.83 0 006.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 002.087-2.165z" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-medblue-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-medblue-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button variant="outline" className="inline-flex items-center" asChild>
                <Link to="/team">
                  <span>View Full Team</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-medblue-600 text-white">
          <div className="container mx-auto max-w-5xl text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Join Us in Transforming Education
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Experience the EduMaster difference with our innovative learning platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="bg-white text-medblue-600 hover:bg-blue-50 text-lg"
                asChild
              >
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-medblue-500 text-lg"
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
