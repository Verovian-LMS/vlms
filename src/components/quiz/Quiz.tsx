
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

interface QuizProps {
  title: string;
  description?: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ 
  title, 
  description, 
  questions,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleOptionSelect = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    setIsAnswerSubmitted(true);
    
    // Update score if answer is correct
    if (selectedOption === currentQuestion.correctOptionIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setQuizCompleted(true);
      if (onComplete) {
        onComplete(score + (selectedOption === currentQuestion.correctOptionIndex ? 1 : 0), questions.length);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
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
              Your score: {score} out of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold my-6 font-exo2">
              {Math.round((score / questions.length) * 100)}%
            </div>
            <div className="mb-6">
              {score === questions.length ? (
                <p className="text-green-600">Perfect score! Excellent work!</p>
              ) : score >= questions.length * 0.7 ? (
                <p className="text-green-600">Great job! You've done well.</p>
              ) : score >= questions.length * 0.5 ? (
                <p className="text-yellow-600">Good effort. There's room for improvement.</p>
              ) : (
                <p className="text-red-600">You might want to review the material and try again.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleRestartQuiz}>Restart Quiz</Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={currentQuestionIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-nunito-sans">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          <div className="mt-2 text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 font-exo2">
          <div className="text-lg font-medium">{currentQuestion.questionText}</div>
          <RadioGroup value={selectedOption?.toString()} className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 p-3 rounded-md border ${
                  isAnswerSubmitted 
                    ? index === currentQuestion.correctOptionIndex
                      ? "border-green-500 bg-green-50"
                      : selectedOption === index
                        ? "border-red-500 bg-red-50"
                        : "border-transparent"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
                onClick={() => handleOptionSelect(index)}
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
                {isAnswerSubmitted && selectedOption === index && index !== currentQuestion.correctOptionIndex && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </RadioGroup>
          
          {isAnswerSubmitted && currentQuestion.explanation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
              <p className="font-medium text-blue-800">Explanation:</p>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Score: {score}/{currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)}
          </div>
          <div className="space-x-2">
            {!isAnswerSubmitted ? (
              <Button onClick={handleSubmitAnswer} disabled={selectedOption === null}>
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

export default Quiz;
