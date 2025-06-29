
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import type { QuizQuestion } from "./Quiz";

interface QuizCreatorProps {
  initialQuiz?: {
    id?: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
  };
  onSave: (quiz: {
    id?: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
  }) => void;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ initialQuiz, onSave }) => {
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState({
    id: initialQuiz?.id || uuidv4(),
    title: initialQuiz?.title || "",
    description: initialQuiz?.description || "",
    questions: initialQuiz?.questions || [
      {
        id: uuidv4(),
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        explanation: ""
      }
    ]
  });

  const handleQuizDataChange = (field: string, value: string) => {
    setQuiz({ ...quiz, [field]: value });
  };

  const handleQuestionChange = (questionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...quiz.questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value;
    
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options
    };
    
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: ""
    };
    
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const removeQuestion = (questionIndex: number) => {
    if (quiz.questions.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "A quiz must have at least one question.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedQuestions = quiz.questions.filter((_, index) => index !== questionIndex);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options.push("");
    
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...quiz.questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.options.length <= 2) {
      toast({
        title: "Cannot Remove",
        description: "A question must have at least two options.",
        variant: "destructive"
      });
      return;
    }
    
    // If removing the correct option, reset correctOptionIndex to 0
    if (optionIndex === question.correctOptionIndex) {
      question.correctOptionIndex = 0;
    } 
    // If removing an option before the correct one, adjust the index
    else if (optionIndex < question.correctOptionIndex) {
      question.correctOptionIndex--;
    }
    
    question.options = question.options.filter((_, index) => index !== optionIndex);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleSave = () => {
    // Basic validation
    if (!quiz.title.trim()) {
      toast({
        title: "Quiz Title Required",
        description: "Please provide a title for your quiz.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate all questions have text and all options have text
    const isValid = quiz.questions.every((question, qIndex) => {
      if (!question.questionText.trim()) {
        toast({
          title: "Invalid Question",
          description: `Question ${qIndex + 1} requires text.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!question.options.every(option => option.trim())) {
        toast({
          title: "Invalid Options",
          description: `All options for question ${qIndex + 1} must have text.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    if (isValid) {
      onSave(quiz);
      toast({
        title: "Quiz Saved",
        description: "Your quiz has been saved successfully."
      });
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-nunito-sans">Quiz Information</CardTitle>
          <CardDescription>Enter the basic information about your quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-exo2">
          <div className="space-y-2">
            <label className="font-medium">Quiz Title</label>
            <Input 
              value={quiz.title} 
              onChange={e => handleQuizDataChange("title", e.target.value)} 
              placeholder="Enter quiz title" 
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium">Description (Optional)</label>
            <Textarea 
              value={quiz.description} 
              onChange={e => handleQuizDataChange("description", e.target.value)} 
              placeholder="Enter a brief description of the quiz" 
              className="w-full"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
      
      <h3 className="text-xl font-bold font-nunito-sans mt-8 mb-4">Questions</h3>
      
      {quiz.questions.map((question, questionIndex) => (
        <Card key={question.id} className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-nunito-sans">Question {questionIndex + 1}</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-red-500"
              onClick={() => removeQuestion(questionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 font-exo2">
            <div className="space-y-2">
              <label className="font-medium">Question Text</label>
              <Textarea 
                value={question.questionText} 
                onChange={e => handleQuestionChange(questionIndex, "questionText", e.target.value)} 
                placeholder="Enter your question" 
                className="w-full"
              />
            </div>
            
            <div className="space-y-4">
              <label className="font-medium">Answer Options</label>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Input 
                    type="radio" 
                    checked={question.correctOptionIndex === optionIndex}
                    onChange={() => handleQuestionChange(questionIndex, "correctOptionIndex", optionIndex)}
                    className="h-4 w-4"
                  />
                  <Input 
                    value={option} 
                    onChange={e => handleOptionChange(questionIndex, optionIndex, e.target.value)} 
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-grow"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => removeOption(questionIndex, optionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => addOption(questionIndex)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Option
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="font-medium">Explanation (Optional)</label>
              <Textarea 
                value={question.explanation || ""} 
                onChange={e => handleQuestionChange(questionIndex, "explanation", e.target.value)} 
                placeholder="Provide an explanation for the correct answer" 
                className="w-full"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={addQuestion}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
        
        <Button onClick={handleSave}>
          Save Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizCreator;
