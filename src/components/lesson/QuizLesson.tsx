
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Relying on localStorage pointer for lesson -> quiz until FastAPI endpoints exist
import { useAuth } from '@/context/FastApiAuthContext';
import { QuizProvider } from '@/context/QuizContext';
import EnhancedQuiz from '@/components/quiz/EnhancedQuiz';

interface QuizLessonProps {
  lessonId: string;
}

const QuizLesson: React.FC<QuizLessonProps> = ({ lessonId }) => {
  const { user } = useAuth();
  const [hasQuiz, setHasQuiz] = useState<boolean>(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previouslyCompleted, setPreviouslyCompleted] = useState<boolean>(false);
  
  useEffect(() => {
    const checkForQuiz = async () => {
      if (!lessonId) return;
      
      try {
        setIsLoading(true);
        // Check local pointer (lesson-first, legacy lecture fallback)
        const pointer = localStorage.getItem(`quizByLesson:${lessonId}`) ||
                        localStorage.getItem(`quizByLecture:${lessonId}`);
        if (pointer) {
          setHasQuiz(true);
          setQuizId(pointer);
          if (user) {
            const attemptRaw = localStorage.getItem(`quizAttempt:${user.id}:${pointer}`);
            if (attemptRaw) {
              try {
                const att = JSON.parse(attemptRaw);
                if (att?.status === 'completed') setPreviouslyCompleted(true);
              } catch {}
            }
          }
        } else {
          setHasQuiz(false);
        }
      } catch (err) {
        console.error("Error checking for quiz:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForQuiz();
  }, [lessonId, user]);
  
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
      
      <QuizProvider quizIdProp={quizId} lessonIdProp={lessonId}>
        <EnhancedQuiz />
      </QuizProvider>
    </motion.div>
  );
};

export default QuizLesson;
