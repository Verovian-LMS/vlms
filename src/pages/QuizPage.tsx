
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Quiz from '@/components/quiz/Quiz';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
// Using local/sample data until FastAPI quiz endpoints exist
import { useAuth } from '@/context/FastApiAuthContext';
import type { QuizQuestion } from '@/components/quiz/Quiz';

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  course_id: string;
  lesson_id?: string;
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
        // Try localStorage first
        const raw = localStorage.getItem(`quiz:${quizId}`);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setQuiz(parsed);
          } catch {
            setError("Invalid local quiz data");
          }
        } else {
          // Fallback sample quiz
          setQuiz({
            id: quizId,
            title: "Introduction to Natural Sciences",
            description: "Test your knowledge of basic scientific concepts.",
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
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError("Failed to load quiz data");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, toast]);

  const handleQuizComplete = async (score: number, total: number) => {
    if (!user || !quiz) return;
    
    try {
      // Save the quiz result locally for now
      const record = {
        user_id: user.id,
        quiz_id: quiz.id,
        score,
        total,
        percentage: (score / total) * 100,
        passed: (score / total) >= 0.7,
        completed_at: new Date().toISOString()
      };
      const key = `quizResult:${user.id}:${quiz.id}`;
      localStorage.setItem(key, JSON.stringify(record));
      
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
