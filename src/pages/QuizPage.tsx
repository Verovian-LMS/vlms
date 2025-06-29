
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Quiz from '@/components/quiz/Quiz';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { QuizQuestion } from '@/components/quiz/Quiz';

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  course_id: string;
  lecture_id?: string;
  created_at: string;
}

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        setError("Quiz ID is missing");
        setLoading(false);
        return;
      }

      try {
        // This is a placeholder for the actual API call
        // In a real implementation, you would fetch from your database
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();

        if (error) throw error;
        
        if (!data) {
          setError("Quiz not found");
        } else {
          // Parse the questions from JSON if stored as string
          const parsedData = {
            ...data,
            questions: typeof data.questions === 'string' 
              ? JSON.parse(data.questions) 
              : data.questions
          };
          
          setQuiz(parsedData);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError("Failed to load quiz data");
        
        // For demo purposes, let's provide sample data
        // Remove this in production
        setQuiz({
          id: "sample-quiz-1",
          title: "Introduction to Medical Anatomy",
          description: "Test your knowledge of basic human anatomy.",
          questions: [
            {
              id: "q1",
              questionText: "Which of the following is NOT a part of the central nervous system?",
              options: [
                "Brain",
                "Spinal cord", 
                "Peripheral nerves",
                "Cerebrospinal fluid"
              ],
              correctOptionIndex: 2,
              explanation: "The peripheral nerves are part of the peripheral nervous system, not the central nervous system."
            },
            {
              id: "q2",
              questionText: "What is the largest organ in the human body?",
              options: [
                "Brain",
                "Liver", 
                "Skin",
                "Lungs"
              ],
              correctOptionIndex: 2,
              explanation: "The skin is the largest organ, covering the entire body and serving multiple important functions."
            },
            {
              id: "q3",
              questionText: "Which chamber of the heart pumps blood to the lungs?",
              options: [
                "Left atrium",
                "Left ventricle", 
                "Right atrium",
                "Right ventricle"
              ],
              correctOptionIndex: 3,
              explanation: "The right ventricle pumps deoxygenated blood to the lungs via the pulmonary artery."
            }
          ],
          course_id: "sample-course-1",
          created_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, toast]);

  const handleQuizComplete = async (score: number, total: number) => {
    if (!user || !quiz) return;
    
    try {
      // Save the quiz result
      // This is a placeholder for the actual API call
      /*
      await supabase.from('quiz_results').insert({
        user_id: user.id,
        quiz_id: quiz.id,
        score,
        total,
        percentage: (score / total) * 100,
        passed: (score / total) >= 0.7, // 70% passing threshold
        completed_at: new Date().toISOString()
      });
      */
      
      toast({
        title: "Quiz Completed",
        description: `You scored ${score} out of ${total} questions.`,
      });
    } catch (err) {
      console.error('Error saving quiz result:', err);
      toast({
        title: "Error",
        description: "Failed to save your quiz results.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-medblue-600" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 rounded"
            >
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700">{error}</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/courses')}
              >
                Return to Courses
              </Button>
            </motion.div>
          ) : quiz ? (
            <Quiz
              title={quiz.title}
              description={quiz.description}
              questions={quiz.questions}
              onComplete={handleQuizComplete}
            />
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuizPage;
