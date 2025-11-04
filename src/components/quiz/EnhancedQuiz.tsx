
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useQuiz } from '@/context/QuizContext';
import type { QuizQuestion } from './Quiz';

interface EnhancedQuizProps {
  onComplete?: (score: number, total: number) => void;
}

const EnhancedQuiz: React.FC<EnhancedQuizProps> = ({ onComplete }) => {
  const { 
    currentQuiz, 
    currentAttempt, 
    timeRemaining,
    startQuiz,
    saveQuizProgress,
    submitQuiz
  } = useQuiz();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Format time remaining as mm:ss
  const formatTimeRemaining = useCallback(() => {
    if (timeRemaining === null) return "";
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // Show warning when time is running low (last 20% of time)
  useEffect(() => {
    if (!timeRemaining || !currentQuiz?.time_limit_minutes) return;
    
    const totalTime = currentQuiz.time_limit_minutes * 60;
    const timeWarningThreshold = totalTime * 0.2; // 20% of time remaining
    
    setShowTimeWarning(timeRemaining <= timeWarningThreshold);
  }, [timeRemaining, currentQuiz]);

  // Load saved answers when attempt changes
  useEffect(() => {
    if (currentAttempt) {
      setAnswers(currentAttempt.answers || {});
    }
  }, [currentAttempt]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmitQuiz();
    }
  }, [timeRemaining]);

  if (!currentQuiz) {
    return null;
  }

  const questions = currentQuiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // If there's no current attempt, show the start screen
  if (!currentAttempt) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-nunito-sans">{currentQuiz.title}</CardTitle>
          <CardDescription>{currentQuiz.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-exo2">
          <div className="p-4 bg-blue-50 rounded-md text-blue-700 space-y-2">
            <p>
              <strong>Questions:</strong> {questions.length}
            </p>
            {currentQuiz.time_limit_minutes && (
              <p>
                <strong>Time limit:</strong> {currentQuiz.time_limit_minutes} minutes
              </p>
            )}
            {currentQuiz.passing_score && (
              <p>
                <strong>Passing score:</strong> {currentQuiz.passing_score}%
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => startQuiz()}>
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If the quiz is completed, show the results
  if (quizCompleted || currentAttempt.status === 'completed') {
    const score = currentAttempt.score || 0;
    const isPassing = currentQuiz.passing_score 
      ? score >= currentQuiz.passing_score
      : score >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-nunito-sans">Quiz Completed!</CardTitle>
            <CardDescription>
              Your score: {score.toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold my-6 font-exo2">
              {Math.round(score)}%
            </div>
            <div className="mb-6">
              {isPassing ? (
                <p className="text-green-600 flex items-center justify-center">
                  <CheckCircle className="mr-2" /> {score === 100 ? "Perfect score! Excellent work!" : "Great job! You've passed the quiz."}
                </p>
              ) : (
                <p className="text-red-600 flex items-center justify-center">
                  <XCircle className="mr-2" /> You didn't reach the passing score. You might want to review the material and try again.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Return to Lesson</Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (isAnswerSubmitted) return;
    
    const newAnswers = { ...answers, [questionId]: optionIndex };
    setAnswers(newAnswers);
    
    // Save progress after each answer
    saveQuizProgress(newAnswers);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || answers[currentQuestion.id] === undefined) return;
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    setIsAnswerSubmitted(false);
    
    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitQuiz = () => {
    submitQuiz(answers);
    setQuizCompleted(true);
    
    if (onComplete) {
      const correctAnswers = questions.filter((q, i) => 
        answers[q.id] === q.correctOptionIndex
      ).length;
      
      onComplete(correctAnswers, questions.length);
    }
  };

  // Calculate progress percentage
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <motion.div
      key={currentQuestionIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-nunito-sans">{currentQuiz.title}</CardTitle>
            
            {timeRemaining !== null && (
              <div className={`flex items-center font-mono text-lg ${
                showTimeWarning ? 'text-red-600 animate-pulse' : 'text-gray-700'
              }`}>
                <Clock className="mr-1 h-5 w-5" />
                {formatTimeRemaining()}
              </div>
            )}
          </div>
          
          {currentQuiz.description && (
            <CardDescription>{currentQuiz.description}</CardDescription>
          )}
          
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Progress</span>
              <span>{answeredCount} of {questions.length} answered</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 font-exo2">
          <div className="text-lg font-medium">{currentQuestion?.questionText}</div>
          
          <RadioGroup 
            value={answers[currentQuestion?.id]?.toString()} 
            className="space-y-3"
          >
            {currentQuestion?.options.map((option, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 p-3 rounded-md border ${
                  isAnswerSubmitted 
                    ? index === currentQuestion.correctOptionIndex
                      ? "border-green-500 bg-green-50"
                      : answers[currentQuestion.id] === index
                        ? "border-red-500 bg-red-50"
                        : "border-transparent"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
                onClick={() => handleOptionSelect(currentQuestion.id, index)}
              >
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`} 
                  disabled={isAnswerSubmitted}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-grow cursor-pointer"
                >
                  {option}
                </Label>
                {isAnswerSubmitted && index === currentQuestion.correctOptionIndex && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {isAnswerSubmitted && answers[currentQuestion.id] === index && 
                  index !== currentQuestion.correctOptionIndex && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </RadioGroup>
          
          {isAnswerSubmitted && currentQuestion?.explanation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
              <p className="font-medium text-blue-800">Explanation:</p>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
            </div>
          )}
          
          {showTimeWarning && !isAnswerSubmitted && (
            <div className="flex items-center text-amber-600 p-2 bg-amber-50 rounded-md">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Time is running out! Please complete the quiz soon.</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Answered: {answeredCount}/{questions.length}
          </div>
          <div className="space-x-2">
            {!isAnswerSubmitted ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={answers[currentQuestion?.id] === undefined}
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EnhancedQuiz;
