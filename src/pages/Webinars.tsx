
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import VideoPlayer from "@/components/video/VideoPlayer";
import { 
  ChevronRight, 
  Clock, 
  Users, 
  Calendar, 
  Medal,
  Check,
  PlayCircle
} from "lucide-react";

// Sample webinar data
const webinars = [
  {
    id: 1,
    title: "Advanced Cardiac Auscultation Techniques",
    description: "Learn to identify subtle heart sounds and murmurs with confidence",
    date: "May 15, 2023",
    duration: "45 minutes",
    instructor: "Dr. Sarah Johnson",
    attendees: 423,
    thumbnailUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    category: "Cardiology",
    progress: 0
  },
  {
    id: 2,
    title: "Interpreting Complex ECG Patterns",
    description: "Master the art of ECG interpretation for difficult cases",
    date: "June 3, 2023",
    duration: "60 minutes",
    instructor: "Dr. Michael Chen",
    attendees: 312,
    thumbnailUrl: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4",
    category: "Cardiology",
    progress: 25
  },
  {
    id: 3,
    title: "Neurological Examination for Medical Students",
    description: "Step-by-step approach to comprehensive neurological assessment",
    date: "June 18, 2023",
    duration: "55 minutes",
    instructor: "Dr. Emma Rodriguez",
    attendees: 289,
    thumbnailUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4",
    category: "Neurology",
    progress: 75
  },
  {
    id: 4,
    title: "Respiratory Pathology: Cases and Discussions",
    description: "Interactive case presentations of common and rare lung diseases",
    date: "July 7, 2023",
    duration: "50 minutes",
    instructor: "Dr. Robert Lee",
    attendees: 356,
    thumbnailUrl: "https://images.unsplash.com/photo-1581595219315-a187dd40c322",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4",
    category: "Pulmonology",
    progress: 50
  },
  {
    id: 5,
    title: "Pharmacology of Antibiotics: Clinical Applications",
    description: "Evidence-based approach to antibiotic selection in clinical practice",
    date: "July 22, 2023",
    duration: "65 minutes",
    instructor: "Dr. Patricia Khan",
    attendees: 401,
    thumbnailUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    category: "Pharmacology",
    progress: 10
  }
];

// Categories for filtering
const categories = [
  "All Webinars",
  "Cardiology",
  "Neurology",
  "Pulmonology",
  "Pharmacology",
  "Surgery",
  "Internal Medicine"
];

const Webinars = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Webinars");
  const [selectedWebinar, setSelectedWebinar] = useState<number | null>(null);
  const [webinarsData, setWebinarsData] = useState(webinars);
  
  // Filter webinars by category
  const filteredWebinars = selectedCategory === "All Webinars" 
    ? webinarsData 
    : webinarsData.filter(webinar => webinar.category === selectedCategory);
  
  // Get current webinar if one is selected
  const currentWebinar = selectedWebinar !== null 
    ? webinarsData.find(w => w.id === selectedWebinar) 
    : null;
    
  // Handle video progress update
  const handleProgressUpdate = (id: number, currentTime: number, duration: number) => {
    // Calculate percentage
    const progressPercent = Math.round((currentTime / duration) * 100);
    
    // Update webinar progress
    setWebinarsData(prevWebinars => 
      prevWebinars.map(webinar => 
        webinar.id === id ? { ...webinar, progress: progressPercent } : webinar
      )
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-slate-50">
        {/* Hero section */}
        <section className="bg-medblue-600 text-white py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Medical Webinars</h1>
              <p className="text-xl text-blue-100">
                Access our library of expert-led webinars to enhance your medical knowledge and skills
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Main content */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {selectedWebinar === null ? (
              <div>
                {/* Category filter */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 overflow-auto"
                >
                  <div className="flex space-x-3 pb-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className={selectedCategory === category ? "bg-medblue-600" : ""}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </motion.div>
                
                {/* Webinars grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWebinars.map((webinar, index) => (
                    <motion.div
                      key={webinar.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-100"
                    >
                      <div className="relative">
                        <img 
                          src={webinar.thumbnailUrl} 
                          alt={webinar.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button 
                            onClick={() => setSelectedWebinar(webinar.id)}
                            className="bg-medblue-600 hover:bg-medblue-700"
                          >
                            <PlayCircle className="mr-2 h-5 w-5" /> Watch Now
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <span className="text-white text-sm font-medium px-2 py-1 bg-medblue-600 rounded">
                            {webinar.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 
                          className="font-bold text-lg mb-2 hover:text-medblue-600 cursor-pointer" 
                          onClick={() => setSelectedWebinar(webinar.id)}
                        >
                          {webinar.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {webinar.description}
                        </p>
                        <div className="flex items-center text-gray-500 text-sm space-x-4 mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{webinar.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{webinar.duration}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2">
                              {/* Placeholder for instructor image */}
                            </div>
                            <span className="text-sm font-medium">{webinar.instructor}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-sm text-gray-500">{webinar.attendees}</span>
                          </div>
                        </div>
                        
                        {webinar.progress > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{webinar.progress}%</span>
                            </div>
                            <Progress value={webinar.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              // Webinar viewing screen
              <div className="max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedWebinar(null)}
                    className="mb-4"
                  >
                    <ChevronRight className="h-4 w-4 transform rotate-180 mr-1" /> Back to webinars
                  </Button>
                  
                  {currentWebinar && (
                    <div>
                      <div className="mb-6">
                        <VideoPlayer 
                          src={currentWebinar.videoUrl} 
                          title={currentWebinar.title}
                          onProgressUpdate={(currentTime, duration) => 
                            handleProgressUpdate(currentWebinar.id, currentTime, duration)
                          }
                        />
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h1 className="text-2xl font-bold mb-2">{currentWebinar.title}</h1>
                        <div className="flex flex-wrap items-center text-gray-500 text-sm gap-4 mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{currentWebinar.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{currentWebinar.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{currentWebinar.attendees} attendees</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-6">
                          {currentWebinar.description}
                        </p>
                        
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-full bg-gray-200 mr-3">
                            {/* Placeholder for instructor image */}
                          </div>
                          <div>
                            <h3 className="font-bold">{currentWebinar.instructor}</h3>
                            <p className="text-sm text-gray-500">Medical Faculty, Harvard University</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Your progress</span>
                            <span className="font-medium">
                              {currentWebinar.progress}% {currentWebinar.progress === 100 && <Check className="inline-block h-4 w-4 text-green-500" />}
                            </span>
                          </div>
                          <Progress value={currentWebinar.progress} className="h-2" />
                        </div>
                        
                        {currentWebinar.progress === 100 && (
                          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                            <Medal className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-green-800">You've completed this webinar! A certificate has been added to your profile.</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Related Webinars</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {webinarsData
                            .filter(w => w.id !== currentWebinar.id && w.category === currentWebinar.category)
                            .slice(0, 3)
                            .map(webinar => (
                              <div 
                                key={webinar.id} 
                                className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setSelectedWebinar(webinar.id)}
                              >
                                <div className="relative mb-3">
                                  <img 
                                    src={webinar.thumbnailUrl} 
                                    alt={webinar.title} 
                                    className="w-full h-32 object-cover rounded"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded">
                                    <PlayCircle className="h-10 w-10 text-white" />
                                  </div>
                                </div>
                                <h4 className="font-medium line-clamp-2">{webinar.title}</h4>
                                <div className="text-sm text-gray-500 mt-1">{webinar.duration}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Webinars;
