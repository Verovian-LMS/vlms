
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CourseCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}

interface CourseCategoryCardProps {
  category: CourseCategory;
  delay?: number;
}

const CourseCard = ({ category, delay = 0 }: CourseCategoryCardProps) => (
  <motion.div 
    className="card-medical card-hover group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay }}
  >
    <div className="relative h-48 overflow-hidden">
      <img 
        src={category.image || 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=500&h=300&q=80'} 
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2 font-nunito-sans">{category.name}</h3>
      <p className="text-gray-600 mb-4 font-exo2">{category.description}</p>
      <Link 
        to={category.slug}
        className="inline-flex items-center text-medblue-600 hover:text-medblue-700 font-medium"
      >
        Explore courses <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  </motion.div>
);

const CourseCategories = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories from database if available
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching categories:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Map database records to our expected format
          const formattedCategories: CourseCategory[] = data.map(cat => ({
            id: cat.category_id.toString(),
            name: cat.name,
            description: cat.description || 'Explore our collection of courses in this category',
            image: '', // You would need to add an image column to the categories table
            slug: `/courses/category/${cat.category_id}`,
          }));
          setCategories(formattedCategories);
        } else {
          // Fallback to default categories if none in database
          setCategories([
            {
              id: "1",
              name: "Medical Sciences",
              description: "Deep dive into anatomy, physiology, and pathology",
              image: 'https://images.unsplash.com/photo-1581093196277-9f6e9b96cc6a?auto=format&fit=crop&w=500&h=300&q=80',
              slug: "/courses/category/medical-sciences",
            },
            {
              id: "2",
              name: "Clinical Skills",
              description: "Learn essential clinical techniques and patient care",
              image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=300&q=80',
              slug: "/courses/category/clinical-skills",
            },
            {
              id: "3",
              name: "Medical Licensing Exams",
              description: "Prepare for USMLE, NCLEX and other licensing exams",
              image: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=500&h=300&q=80',
              slug: "/courses/category/licensing-exams",
            },
            {
              id: "4",
              name: "Medical Technology",
              description: "Discover the latest advances in medical technology",
              image: 'https://images.unsplash.com/photo-1576671414121-aa2d70260ade?auto=format&fit=crop&w=500&h=300&q=80',
              slug: "/courses/category/medical-technology",
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Course Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading categories...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="bg-gray-100 h-72 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Course Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No categories available at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-nunito-sans"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore Our Course Categories
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto font-exo2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Comprehensive learning paths tailored to your medical education needs
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CourseCard 
              key={category.id} 
              category={category} 
              delay={0.1 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseCategories;
