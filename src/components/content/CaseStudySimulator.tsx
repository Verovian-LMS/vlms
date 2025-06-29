
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseStudyStep {
  id: string;
  title: string;
  description: string;
  question: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  expertResponse?: string;
  requireFreeformResponse?: boolean;
  type: 'multiple-choice' | 'freeform';
}

interface CaseStudySimulatorProps {
  title: string;
  description: string;
  steps: CaseStudyStep[];
  onComplete?: (responses: Record<string, any>) => void;
}

const CaseStudySimulator: React.FC<CaseStudySimulatorProps> = ({
  title,
  description,
  steps,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [freeformResponse, setFreeformResponse] = useState('');
  const [showExpertResponse, setShowExpertResponse] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  
  const currentStep = steps[currentStepIndex];
  
  const handleOptionSelect = (optionId: string) => {
    setUserResponses((prev) => ({
      ...prev,
      [currentStep.id]: optionId
    }));
  };
  
  const handleFreeformSubmit = () => {
    if (freeformResponse.trim().length < 10) {
      toast({
        title: "Response too short",
        description: "Please provide a more detailed answer",
        variant: "destructive"
      });
      return;
    }
    
    setUserResponses((prev) => ({
      ...prev,
      [currentStep.id]: freeformResponse
    }));
    
    setShowExpertResponse(true);
  };
  
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setFreeformResponse('');
      setShowExpertResponse(false);
    } else {
      completeCaseStudy();
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setShowExpertResponse(false);
    }
  };
  
  const completeCaseStudy = () => {
    setIsCompleted(true);
    
    if (onComplete) {
      onComplete(userResponses);
    }
    
    toast({
      title: "Case study completed!",
      description: "You have completed all steps in this case study.",
    });
  };
  
  const hasResponded = () => {
    return !!userResponses[currentStep.id];
  };
  
  if (isCompleted) {
    return (
      <Card className="border-2 border-primary/10">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-center flex items-center justify-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> 
            Case Study Completed
          </CardTitle>
          <CardDescription className="text-center">{title}</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-lg font-medium text-slate-700">
              You have successfully completed this case study!
            </p>
            
            <p className="text-sm text-slate-600">
              You've worked through all scenarios and provided your insights.
              This experience will help prepare you for real-world clinical situations.
            </p>
          </div>
          
          <div className="mt-6 space-y-4">
            <h4 className="font-medium text-center">Summary of Case Study Steps:</h4>
            <div className="space-y-3 mt-4">
              {steps.map((step, index) => (
                <div key={step.id} className="border rounded-md p-3">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mr-2">
                      {index + 1}
                    </div>
                    <h5 className="font-medium">{step.title}</h5>
                  </div>
                  {userResponses[step.id] && step.type === 'multiple-choice' && (
                    <div className="mt-2 ml-8">
                      {step.options?.find(opt => opt.id === userResponses[step.id])?.isCorrect ? (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" /> Correct choice
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-amber-600">
                          <AlertCircle className="h-4 w-4 mr-1" /> Learning opportunity
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t p-4">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStepIndex(0);
              setUserResponses({});
              setFreeformResponse('');
              setShowExpertResponse(false);
              setIsCompleted(false);
            }}
          >
            Restart Case Study
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="border-2 border-slate-200">
      <CardHeader className="bg-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="text-sm font-medium">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
        <div className="w-full bg-slate-200 h-1 mt-2">
          <div 
            className="bg-primary h-1 transition-all" 
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }} 
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">{currentStep.title}</h3>
            <p className="text-slate-600">{currentStep.description}</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-md border">
            <h4 className="font-medium mb-2">{currentStep.question}</h4>
            
            {currentStep.type === 'multiple-choice' && currentStep.options && (
              <div className="space-y-3 mt-4">
                {currentStep.options.map((option) => {
                  const isSelected = userResponses[currentStep.id] === option.id;
                  
                  return (
                    <div key={option.id}>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          isSelected && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleOptionSelect(option.id)}
                      >
                        {option.text}
                      </Button>
                      
                      {isSelected && (
                        <div className={cn(
                          "mt-2 p-3 text-sm rounded-md",
                          option.isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
                        )}>
                          {option.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {currentStep.type === 'freeform' && (
              <div className="space-y-4 mt-4">
                <Textarea
                  placeholder="Enter your analysis here..."
                  value={freeformResponse}
                  onChange={(e) => setFreeformResponse(e.target.value)}
                  className="min-h-[150px]"
                  disabled={showExpertResponse}
                />
                
                {!showExpertResponse && (
                  <Button 
                    onClick={handleFreeformSubmit}
                    disabled={freeformResponse.trim().length < 10}
                  >
                    Submit Analysis
                  </Button>
                )}
                
                {showExpertResponse && currentStep.expertResponse && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                    <h5 className="font-medium text-blue-800 mb-2">Expert Response:</h5>
                    <p className="text-blue-700 text-sm">{currentStep.expertResponse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <Button 
          variant="outline" 
          onClick={goToPreviousStep}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <Button 
          onClick={goToNextStep}
          disabled={
            (currentStep.type === 'multiple-choice' && !hasResponded()) ||
            (currentStep.type === 'freeform' && currentStep.requireFreeformResponse && !showExpertResponse)
          }
        >
          {currentStepIndex < steps.length - 1 ? (
            <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
          ) : (
            'Complete Case Study'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CaseStudySimulator;
