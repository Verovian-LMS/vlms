
import React, { useState } from 'react';
import { HelpCircle, Check, X, ArrowRight, RefreshCw, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}

interface QuizEmbedProps {
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, totalQuestions: number) => void;
}

const QuizEmbed: React.FC<QuizEmbedProps> = ({
  lessonId,
  title,
  description,
  questions,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  const checkAnswer = () => {
    const questionId = currentQuestion.id;
    const selectedOptionId = selectedOptions[questionId];
    
    if (!selectedOptionId) {
      toast({
        title: "No option selected",
        description: "Please select an answer before checking",
        variant: "default"
      });
      return;
    }
    
    const isCorrect = currentQuestion.options.find(
      option => option.id === selectedOptionId
    )?.isCorrect;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowResults(prev => ({
      ...prev,
      [questionId]: true
    }));
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };
  
  const completeQuiz = () => {
    setIsCompleted(true);
    
    if (onComplete) {
      onComplete(score, questions.length);
    }
    
    toast({
      title: "Quiz completed!",
      description: `You scored ${score} out of ${questions.length} questions`,
      variant: "default"
    });
    
    // Here you would typically save the result to your backend
    console.log(`Quiz completed for lesson ${lessonId} with score ${score}/${questions.length}`);
  };
  
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions({});
    setShowResults({});
    setIsCompleted(false);
    setScore(0);
  };
  
  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    let resultMessage = "Good effort!";
    
    if (percentage >= 90) resultMessage = "Excellent job!";
    else if (percentage >= 70) resultMessage = "Well done!";
    else if (percentage < 40) resultMessage = "Keep practicing!";
    
    return (
      <Card className="border-2 border-primary/10">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-center text-primary flex items-center justify-center">
            <Award className="mr-2 h-6 w-6" /> Quiz Results
          </CardTitle>
          <CardDescription className="text-center">{title}</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{percentage}%</div>
            <p className="text-lg font-medium text-slate-700">{resultMessage}</p>
            <p className="text-sm text-slate-500 mt-1">
              You answered {score} out of {questions.length} questions correctly
            </p>
          </div>
          
          <Progress 
            value={percentage} 
            className="h-3 mt-4" 
            indicatorClassName={cn(
              percentage >= 70 ? "bg-green-500" : 
              percentage >= 40 ? "bg-amber-500" : 
              "bg-red-500"
            )}
          />
          
          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Question Summary:</h4>
            <div className="space-y-2">
              {questions.map((question, index) => {
                const selectedOption = selectedOptions[question.id];
                const isCorrect = question.options.find(
                  opt => opt.id === selectedOption
                )?.isCorrect;
                
                return (
                  <div 
                    key={question.id} 
                    className={cn(
                      "p-3 rounded-md text-sm",
                      isCorrect 
                        ? "bg-green-50 border border-green-100" 
                        : "bg-red-50 border border-red-100"
                    )}
                  >
                    <div className="flex items-start">
                      <div className="mr-2">
                        {isCorrect ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p>{index + 1}. {question.question}</p>
                        {!isCorrect && question.explanation && (
                          <p className="text-xs mt-1 text-slate-600">{question.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t p-4">
          <Button onClick={resetQuiz} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <HelpCircle className="mr-2 h-5 w-5 text-primary" /> {title}
          </CardTitle>
          <div className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          
          <RadioGroup 
            value={selectedOptions[currentQuestion.id]} 
            onValueChange={(value) => handleOptionSelect(currentQuestion.id, value)}
            className="space-y-3"
            disabled={showResults[currentQuestion.id]}
          >
            {currentQuestion.options.map(option => {
              const isSelected = selectedOptions[currentQuestion.id] === option.id;
              const showResult = showResults[currentQuestion.id];
              const resultClass = showResult
                ? option.isCorrect
                  ? "bg-green-50 border-green-200"
                  : isSelected
                    ? "bg-red-50 border-red-200"
                    : ""
                : "";
              
              return (
                <div 
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-2 rounded-md p-3 border",
                    isSelected && !showResult ? "border-primary/50 bg-primary/5" : "border-slate-200",
                    resultClass
                  )}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label 
                    htmlFor={option.id}
                    className="flex-grow cursor-pointer"
                  >
                    {option.text}
                  </Label>
                  
                  {showResult && option.isCorrect && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                  
                  {showResult && !option.isCorrect && isSelected && (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              );
            })}
          </RadioGroup>
          
          {showResults[currentQuestion.id] && currentQuestion.explanation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        {!showResults[currentQuestion.id] ? (
          <Button 
            onClick={checkAnswer} 
            className="w-full"
          >
            Check Answer
          </Button>
        ) : (
          <Button 
            onClick={goToNextQuestion} 
            className="w-full"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
            ) : (
              'Complete Quiz'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizEmbed;
