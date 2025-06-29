
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [loading, setLoading] = useState(true);
  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setTestimonials(data as Testimonial[]);
        } else {
          // If no testimonials are found, we can use placeholder data or leave empty
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestimonials();
  }, []);

  const nextSlide = () => {
    if (testimonials.length === 0) return;
    setCurrent(current === testimonials.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    if (testimonials.length === 0) return;
    setCurrent(current === 0 ? testimonials.length - 1 : current - 1);
  };

  useEffect(() => {
    if (autoplay && testimonials.length > 0) {
      timeout.current = setTimeout(() => {
        nextSlide();
      }, 5000);
    }
    
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [current, autoplay, testimonials.length]);

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (timeout.current) clearTimeout(timeout.current);
    setAutoplay(false);
    direction === 'prev' ? prevSlide() : nextSlide();
    
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => {
      setAutoplay(true);
    }, 10000);
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-medblue-50 to-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-medblue-50 to-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              What Our Students Say
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Testimonials will appear here once students share their experiences.
            </motion.p>
          </div>
          
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
              <p className="text-gray-700 text-lg italic mb-6">
                "Be the first to share your experience with our courses!"
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-medblue-50 to-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            What Our Students Say
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of medical students and professionals who've transformed their learning
          </motion.p>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="overflow-hidden">
            <div className="flex items-center relative">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  className="w-full flex-shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: index === current ? 1 : 0,
                    x: `${(index - current) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: index === current ? 'relative' : 'absolute',
                  }}
                >
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg italic mb-6">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={testimonial.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'} 
                          alt={testimonial.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center mt-8 gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => handleNavigation('prev')}
              disabled={testimonials.length <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === current ? 'bg-medblue-600 w-4' : 'bg-gray-300'
                  }`}
                  onClick={() => {
                    setCurrent(index);
                    setAutoplay(false);
                    setTimeout(() => setAutoplay(true), 10000);
                  }}
                ></button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => handleNavigation('next')}
              disabled={testimonials.length <= 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
