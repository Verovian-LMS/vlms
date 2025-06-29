
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuizProvider } from '@/context/QuizContext';
import EnhancedQuiz from '@/components/quiz/EnhancedQuiz';

interface QuizLectureProps {
  lectureId: string;
}

const QuizLecture: React.FC<QuizLectureProps> = ({ lectureId }) => {
  const { user } = useAuth();
  const [hasQuiz, setHasQuiz] = useState<boolean>(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previouslyCompleted, setPreviouslyCompleted] = useState<boolean>(false);
  
  useEffect(() => {
    const checkForQuiz = async () => {
      if (!lectureId) return;
      
      try {
        setIsLoading(true);
        
        // Check if there's a quiz for this lecture
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('id')
          .eq('lecture_id', lectureId)
          .single();
        
        if (quizError) {
          if (quizError.code !== 'PGRST116') { // Not a "no rows returned" error
            console.error("Error checking for quiz:", quizError);
          }
          setHasQuiz(false);
          return;
        }
        
        if (quizData) {
          setHasQuiz(true);
          setQuizId(quizData.id);
          
          // If user is logged in, check if they've completed this quiz
          if (user) {
            const { data: attemptData } = await supabase
              .from('quizAttempts')
              .select('*')
              .eq('quiz_id', quizData.id)
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .order('completed_at', { ascending: false })
              .limit(1)
              .single();
              
            if (attemptData) {
              setPreviouslyCompleted(true);
            }
          }
        }
      } catch (err) {
        console.error("Error checking for quiz:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForQuiz();
  }, [lectureId, user]);
  
  if (isLoading) {
    return (
      <div className="w-full py-8 flex justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-medblue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!hasQuiz) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 border-t border-gray-200 pt-8"
    >
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Book className="mr-2 text-medblue-600" />
          <h2 className="text-2xl font-bold font-nunito-sans">Knowledge Check</h2>
        </div>
        
        {previouslyCompleted && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">
              You've already completed this quiz. Feel free to take it again to improve your knowledge!
            </p>
          </div>
        )}
      </div>
      
      <QuizProvider>
        <EnhancedQuiz />
      </QuizProvider>
    </motion.div>
  );
};

export default QuizLecture;
