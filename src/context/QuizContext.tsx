
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
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
  lecture_id: string | null;
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

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { quizId, lectureId } = useParams<{ quizId: string; lectureId: string }>();
  
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz data when component mounts
  useEffect(() => {
    if (quizId) {
      fetchQuizData(quizId);
    } else if (lectureId) {
      fetchQuizByLectureId(lectureId);
    }
  }, [quizId, lectureId]);

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
      
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (quizError) throw quizError;
      
      // Fetch quiz questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id)
        .order('sequence_order', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      // For each question, fetch its answers
      const questionsWithOptions = await Promise.all(
        questionsData.map(async (question) => {
          const { data: answersData, error: answersError } = await supabase
            .from('answers')
            .select('*')
            .eq('questions_id', question.id)
            .order('sequence_order', { ascending: true });
          
          if (answersError) throw answersError;
          
          // Transform to match QuizQuestion interface
          const correctOptionIndex = answersData.findIndex(answer => answer.is_correct);
          
          return {
            id: question.id,
            questionText: question.question_text,
            options: answersData.map(answer => answer.answer_text),
            correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : 0,
            explanation: question.explanation || ""
          };
        })
      );
      
      setCurrentQuiz({
        ...quizData,
        questions: questionsWithOptions
      });
      
      // Check if user has an in-progress attempt
      if (user) {
        const { data: attemptData, error: attemptError } = await supabase
          .from('quizAttempts')
          .select('*')
          .eq('quiz_id', id)
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!attemptError && attemptData) {
          // Get saved responses for this attempt
          const { data: responsesData } = await supabase
            .from('quizResponses')
            .select('*')
            .eq('attempt_id', attemptData.id);
          
          // Convert responses to answer map
          const answers: Record<string, number> = {};
          if (responsesData) {
            responsesData.forEach(response => {
              const question = questionsWithOptions.find(q => q.id === response.question_id);
              if (question) {
                const answerIndex = question.options.findIndex(
                  opt => opt === response.response_text
                );
                if (answerIndex >= 0) {
                  answers[response.question_id] = answerIndex;
                }
              }
            });
          }
          
          setCurrentAttempt({
            ...attemptData,
            answers
          });
        }
      }
      
    } catch (err) {
      console.error("Error fetching quiz data:", err);
      setError("Failed to load quiz data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizByLectureId = async (lectureId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Find quiz associated with this lecture
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lecture_id', lectureId)
        .single();
      
      if (quizError) {
        if (quizError.code === 'PGRST116') {
          setIsLoading(false);
          return; // No quiz for this lecture, not an error
        }
        throw quizError;
      }
      
      if (quizData) {
        await fetchQuizData(quizData.id);
      }
      
    } catch (err) {
      console.error("Error fetching quiz for lecture:", err);
      setError("Failed to load quiz data. Please try again.");
      setIsLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!user || !currentQuiz) return;
    
    try {
      // Create a new attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('quizAttempts')
        .insert({
          quiz_id: currentQuiz.id,
          user_id: user.id,
          started_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .select()
        .single();
      
      if (attemptError) throw attemptError;
      
      setCurrentAttempt({
        ...attemptData,
        answers: {}
      });
      
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
      
      // Save each answer to the database
      for (const [questionId, answerIndex] of Object.entries(answers)) {
        const question = currentQuiz.questions.find(q => q.id === questionId);
        if (!question) continue;
        
        // Check if response already exists
        const { data: existingResponse } = await supabase
          .from('quizResponses')
          .select('*')
          .eq('attempt_id', currentAttempt.id)
          .eq('question_id', questionId)
          .single();
        
        const responseText = question.options[answerIndex];
        const isCorrect = answerIndex === question.correctOptionIndex;
        
        if (existingResponse) {
          // Update existing response
          await supabase
            .from('quizResponses')
            .update({
              response_text: responseText,
              is_correct: isCorrect
            })
            .eq('id', existingResponse.id);
        } else {
          // Insert new response
          await supabase
            .from('quizResponses')
            .insert({
              attempt_id: currentAttempt.id,
              question_id: questionId,
              response_text: responseText,
              is_correct: isCorrect
            });
        }
      }
      
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
      
      // Update the attempt
      const { error: updateError } = await supabase
        .from('quizAttempts')
        .update({
          completed_at: new Date().toISOString(),
          score: score,
          status: 'completed'
        })
        .eq('id', currentAttempt.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setCurrentAttempt({
        ...currentAttempt,
        completed_at: new Date().toISOString(),
        score: score,
        status: 'completed',
        answers: { ...answers }
      });
      
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
