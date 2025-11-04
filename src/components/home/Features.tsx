
import React from "react";
import { motion } from "framer-motion";
import { Video, BookOpen, Activity, Brain, Clock, Monitor } from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const features = [
  {
    icon: <Video className="w-8 h-8 text-medblue-600" />,
    title: "High-Yield Video Lessons",
    description: "Concise, focused videos taught by expert educators covering essential topics"
  },
  {
    icon: <Activity className="w-8 h-8 text-medteal-600" />,
    title: "Interactive Quizzes",
    description: "Reinforce learning with case-based questions in standardized exam formats"
  },
  {
    icon: <BookOpen className="w-8 h-8 text-medblue-600" />,
    title: "Smart Flashcards",
    description: "Spaced repetition system optimizes your study schedule based on performance"
  },
  {
    icon: <Brain className="w-8 h-8 text-medteal-600" />,
    title: "AI-Powered Learning",
    description: "Personalized study paths adapting to your strengths and weaknesses"
  },
  {
    icon: <Clock className="w-8 h-8 text-medblue-600" />,
    title: "Study Timer & Analytics",
    description: "Track your progress and optimize your study schedule with detailed insights"
  },
  {
    icon: <Monitor className="w-8 h-8 text-medteal-600" />,
    title: "Cross-Device Sync",
    description: "Seamlessly continue learning on any device with cloud synchronization"
  }
];

const Feature = ({ icon, title, description, delay = 0 }: FeatureProps) => (
  <motion.div 
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="bg-slate-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const Features = () => {
  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Powerful Features to Enhance Your Learning
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to succeed in your educational journey
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={feature.title} 
              {...feature} 
              delay={0.1 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
