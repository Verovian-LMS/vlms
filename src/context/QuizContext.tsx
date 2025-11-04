
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Using local storage stubs until FastAPI quiz endpoints exist
import { useAuth } from './FastApiAuthContext';
import { useToast } from '@/hooks/use-toast';
import { QuizQuestion } from '@/components/quiz/Quiz';

interface QuizContextType {
  // Quiz data
  currentQuiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
  
  // Quiz attempt state
  currentAttempt: QuizAttempt | null;
  timeRemaining: number | null;
  
  // Actions
  startQuiz: () => Promise<void>;
  saveQuizProgress: (answers: Record<string, number>) => Promise<void>;
  submitQuiz: (answers: Record<string, number>) => Promise<void>;
  resetQuiz: () => void;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number | null;
  passing_score: number | null;
  max_attempts: number;
  lesson_id: string | null;
  course_id: string | null;
  questions: QuizQuestion[];
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  answers: Record<string, number>; // question_id -> selected_option_index
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

interface QuizProviderProps {
  children: React.ReactNode;
  quizIdProp?: string | null;
  lessonIdProp?: string | null;
}

export function QuizProvider({ children, quizIdProp = null, lessonIdProp = null }: QuizProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { quizId, lessonId } = useParams<{ quizId: string; lessonId: string }>();
  
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz data when component mounts
  useEffect(() => {
    const resolvedQuizId = quizIdProp || quizId || null;
    const resolvedLessonId = lessonIdProp || lessonId || null;
    if (resolvedQuizId) {
      fetchQuizData(resolvedQuizId);
    } else if (resolvedLessonId) {
      fetchQuizByLessonId(resolvedLessonId);
    }
  }, [quizIdProp, lessonIdProp, quizId, lessonId]);

  // Timer effect for timed quizzes
  useEffect(() => {
    if (!currentAttempt || !currentQuiz?.time_limit_minutes || currentAttempt.status !== 'in_progress') {
      return;
    }
    
    const startedAt = new Date(currentAttempt.started_at).getTime();
    const timeLimit = currentQuiz.time_limit_minutes * 60 * 1000; // convert to ms
    const endTime = startedAt + timeLimit;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeRemaining(0);
        // Auto-submit the quiz when time expires
        submitQuiz(currentAttempt.answers);
      } else {
        setTimeRemaining(Math.floor(remaining / 1000)); // convert to seconds
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentAttempt, currentQuiz]);

  const fetchQuizData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load quiz from localStorage or use sample
      const localQuizRaw = localStorage.getItem(`quiz:${id}`);
      let localQuiz: any | null = null;
      if (localQuizRaw) {
        try { localQuiz = JSON.parse(localQuizRaw); } catch {}
      }

      if (!localQuiz) {
        // Fallback sample quiz
        localQuiz = {
          id,
          title: "Sample Quiz",
          description: "Quick knowledge check.",
          time_limit_minutes: 10,
          passing_score: 70,
          max_attempts: 3,
          lesson_id: null,
          course_id: null,
          questions: [
            {
              id: "q1",
              questionText: "What is 2 + 2?",
              options: ["3", "4", "5", "6"],
              correctOptionIndex: 1,
              explanation: "Basic arithmetic: 2 + 2 = 4."
            },
            {
              id: "q2",
              questionText: "Which is a mammal?",
              options: ["Shark", "Eagle", "Dolphin", "Lizard"],
              correctOptionIndex: 2,
              explanation: "Dolphins are mammals."
            }
          ] as QuizQuestion[]
        };
      }

      setCurrentQuiz(localQuiz);

      // Load in-progress attempt from localStorage
      if (user) {
        const attemptRaw = localStorage.getItem(`quizAttempt:${user.id}:${id}`);
        if (attemptRaw) {
          try {
            const attempt = JSON.parse(attemptRaw);
            setCurrentAttempt({ ...attempt });
          } catch {}
        }
      }
      
    } catch (err) {
      console.error("Error fetching quiz data:", err);
      setError("Failed to load quiz data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizByLessonId = async (lessonId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Map lesson -> quiz via localStorage (no legacy fallback)
      const pointer = localStorage.getItem(`quizByLesson:${lessonId}`);
      if (!pointer) {
        setIsLoading(false);
        return;
      }
      await fetchQuizData(pointer);
      
    } catch (err) {
      console.error("Error fetching quiz for lesson:", err);
      setError("Failed to load quiz data. Please try again.");
      setIsLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!user || !currentQuiz) return;
    
    try {
      // Create a new local attempt
      const attemptData = {
        id: crypto.randomUUID(),
        quiz_id: currentQuiz.id,
        user_id: user.id,
        started_at: new Date().toISOString(),
        completed_at: null,
        score: null,
        status: 'in_progress' as const,
        answers: {}
      };
      setCurrentAttempt(attemptData);
      localStorage.setItem(`quizAttempt:${user.id}:${currentQuiz.id}`, JSON.stringify(attemptData));
      
      // Start the timer if it's a timed quiz
      if (currentQuiz.time_limit_minutes) {
        setTimeRemaining(currentQuiz.time_limit_minutes * 60); // in seconds
      }
      
      toast({
        title: "Quiz Started",
        description: currentQuiz.time_limit_minutes 
          ? `You have ${currentQuiz.time_limit_minutes} minutes to complete this quiz.`
          : "Good luck with your quiz!",
      });
      
    } catch (err) {
      console.error("Error starting quiz:", err);
      setError("Failed to start quiz. Please try again.");
    }
  };

  const saveQuizProgress = async (answers: Record<string, number>) => {
    if (!user || !currentQuiz || !currentAttempt) return;
    
    try {
      // Update the attempt answers in memory
      setCurrentAttempt({
        ...currentAttempt,
        answers: { ...answers }
      });
      // Persist attempt answers locally
      const updatedAttempt = {
        ...currentAttempt,
        answers: { ...answers }
      };
      localStorage.setItem(`quizAttempt:${user.id}:${currentQuiz.id}`, JSON.stringify(updatedAttempt));
      
    } catch (err) {
      console.error("Error saving quiz progress:", err);
      toast({
        title: "Warning",
        description: "Failed to save your progress. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const submitQuiz = async (answers: Record<string, number>) => {
    if (!user || !currentQuiz || !currentAttempt) return;
    
    try {
      // Save the final answers
      await saveQuizProgress(answers);
      
      // Calculate score
      let correctAnswers = 0;
      const totalAnswers = Object.keys(answers).length;
      
      for (const [questionId, answerIndex] of Object.entries(answers)) {
        const question = currentQuiz.questions.find(q => q.id === questionId);
        if (question && answerIndex === question.correctOptionIndex) {
          correctAnswers++;
        }
      }
      
      const score = totalAnswers > 0 ? (correctAnswers / currentQuiz.questions.length) * 100 : 0;
      
      // Update local attempt
      setCurrentAttempt({
        ...currentAttempt,
        completed_at: new Date().toISOString(),
        score: score,
        status: 'completed',
        answers: { ...answers }
      });
      localStorage.setItem(`quizAttempt:${user.id}:${currentQuiz.id}`,
        JSON.stringify({
          ...currentAttempt,
          completed_at: new Date().toISOString(),
          score,
          status: 'completed',
          answers: { ...answers }
        })
      );
      
      toast({
        title: "Quiz Submitted",
        description: `You scored ${score.toFixed(1)}% on this quiz.`,
      });
      
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    }
  };

  const resetQuiz = () => {
    setCurrentAttempt(null);
    setTimeRemaining(null);
  };

  const value = {
    currentQuiz,
    isLoading,
    error,
    currentAttempt,
    timeRemaining,
    startQuiz,
    saveQuizProgress,
    submitQuiz,
    resetQuiz
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
