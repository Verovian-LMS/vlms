
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, ClipboardCheck, HeartPulse, Stethoscope, FilePlus2 } from "lucide-react";

const VirtualPatient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [treatment, setTreatment] = useState<string | null>(null);
  
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      if (!selectedOption && currentStep !== 4) {
        toast({
          title: "Selection required",
          description: "Please select an option before continuing.",
          variant: "destructive",
        });
        return;
      }
      
      setCurrentStep(currentStep + 1);
      
      if (currentStep === 2) {
        // Set diagnosis based on selection
        if (selectedOption === "option1") {
          setDiagnosis("Acute Myocardial Infarction");
        } else if (selectedOption === "option2") {
          setDiagnosis("Unstable Angina");
        } else if (selectedOption === "option3") {
          setDiagnosis("Stable Angina");
        } else {
          setDiagnosis("Gastroesophageal Reflux Disease");
        }
      }
      
      if (currentStep === 3) {
        // Set treatment based on selection
        if (selectedOption === "option1") {
          setTreatment("Primary PCI with stent placement");
        } else if (selectedOption === "option2") {
          setTreatment("Anti-platelet therapy and cardiac catheterization");
        } else if (selectedOption === "option3") {
          setTreatment("Beta-blockers and lifestyle modification");
        } else {
          setTreatment("Proton pump inhibitors and dietary changes");
        }
      }
      
      setSelectedOption(null);
    } else {
      // Complete scenario
      toast({
        title: "Scenario completed!",
        description: "Your clinical decisions have been recorded.",
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };
  
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Patient History</h3>
              <p>
                A 62-year-old male presents to the emergency department with crushing chest pain that began 2 hours ago while mowing his lawn. 
                The pain radiates to his left arm and jaw, and is accompanied by shortness of breath and diaphoresis. 
                He has a history of hypertension, hyperlipidemia, and type 2 diabetes.
              </p>
              <div className="pt-4">
                <h3 className="font-medium text-lg">Which initial tests would you order?</h3>
                <RadioGroup className="mt-3 space-y-3">
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option1" 
                      value="option1" 
                      onClick={() => handleOptionSelect("option1")}
                    />
                    <Label htmlFor="option1" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">ECG, cardiac enzymes, and chest X-ray</span>
                      The most appropriate first tests for suspected ACS.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option2" 
                      value="option2" 
                      onClick={() => handleOptionSelect("option2")}
                    />
                    <Label htmlFor="option2" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Stress test and echocardiogram</span>
                      Important but not the initial tests in an emergency situation.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option3" 
                      value="option3" 
                      onClick={() => handleOptionSelect("option3")}
                    />
                    <Label htmlFor="option3" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Cardiac MRI</span>
                      Useful for detailed cardiac imaging but not the first-line test for acute chest pain.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option4" 
                      value="option4" 
                      onClick={() => handleOptionSelect("option4")}
                    />
                    <Label htmlFor="option4" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">CT scan of the chest</span>
                      Helpful for ruling out aortic dissection but not the first choice for suspected cardiac events.
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Test Results</h3>
              <p>
                ECG shows ST-segment elevation in leads V1-V4. Troponin I level is elevated at 0.32 ng/mL (normal &lt; 0.04 ng/mL). 
                CK-MB is also elevated. Chest X-ray shows no acute pathology.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">ECG Findings</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>ST-segment elevation in V1-V4</li>
                    <li>Q waves beginning to form in V2-V3</li>
                    <li>No significant rhythm abnormalities</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Laboratory Values</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Troponin I: 0.32 ng/mL (elevated)</li>
                    <li>CK-MB: 12.3 ng/mL (elevated)</li>
                    <li>WBC: 11.2 K/µL (slightly elevated)</li>
                    <li>Glucose: 172 mg/dL</li>
                  </ul>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="font-medium text-lg">What is your diagnosis?</h3>
                <RadioGroup className="mt-3 space-y-3">
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option1" 
                      value="option1" 
                      onClick={() => handleOptionSelect("option1")}
                    />
                    <Label htmlFor="option1" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Acute Myocardial Infarction (STEMI)</span>
                      The ST-segment elevation and elevated cardiac markers strongly suggest this diagnosis.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option2" 
                      value="option2"
                      onClick={() => handleOptionSelect("option2")}
                    />
                    <Label htmlFor="option2" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Unstable Angina</span>
                      While a possibility, the ECG changes and elevated troponin suggest myocardial damage.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option3" 
                      value="option3"
                      onClick={() => handleOptionSelect("option3")}
                    />
                    <Label htmlFor="option3" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Stable Angina</span>
                      Not consistent with the acute presentation and ECG changes.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option4" 
                      value="option4"
                      onClick={() => handleOptionSelect("option4")}
                    />
                    <Label htmlFor="option4" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Gastroesophageal Reflux Disease</span>
                      The ECG and enzyme abnormalities rule out this diagnosis.
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Treatment Decision</h3>
              <p>
                You've diagnosed the patient with <span className="font-medium">{diagnosis}</span>. 
                The patient remains symptomatic with ongoing chest pain despite sublingual nitroglycerin. 
                Vital signs: BP 145/85, HR 92, RR 20, O2 sat 94% on room air.
              </p>
              <div className="pt-4">
                <h3 className="font-medium text-lg">What is your treatment plan?</h3>
                <RadioGroup className="mt-3 space-y-3">
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option1" 
                      value="option1"
                      onClick={() => handleOptionSelect("option1")}
                    />
                    <Label htmlFor="option1" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Immediate cardiac catheterization with primary PCI</span>
                      The standard of care for STEMI within the appropriate time window.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option2" 
                      value="option2"
                      onClick={() => handleOptionSelect("option2")}
                    />
                    <Label htmlFor="option2" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Thrombolytic therapy</span>
                      An option when PCI is not available, but less preferable if PCI can be performed within the appropriate time window.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option3" 
                      value="option3"
                      onClick={() => handleOptionSelect("option3")}
                    />
                    <Label htmlFor="option3" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Medical management with antiplatelet therapy and heparin</span>
                      Insufficient as primary therapy for STEMI.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem 
                      id="option4" 
                      value="option4"
                      onClick={() => handleOptionSelect("option4")}
                    />
                    <Label htmlFor="option4" className="leading-relaxed font-normal text-base">
                      <span className="font-medium text-base block mb-1">Elective cardiac catheterization within 24-48 hours</span>
                      Too delayed for a patient with STEMI.
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Outcome and Follow-up</h3>
              <div className="p-6 border rounded-xl bg-green-50">
                <h4 className="text-xl font-medium text-green-800 mb-3">Patient Outcome</h4>
                <p className="text-green-700 mb-4">
                  The patient underwent {treatment} and recovered successfully. The coronary angiogram revealed a 100% occlusion 
                  of the left anterior descending artery, which was successfully stented.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-white rounded-lg">
                    <h5 className="font-medium mb-2">Diagnosis</h5>
                    <p>{diagnosis}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <h5 className="font-medium mb-2">Treatment</h5>
                    <p>{treatment}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h5 className="font-medium mb-2">Learning Points</h5>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Prompt recognition of STEMI is critical for timely intervention</li>
                    <li>Primary PCI is the preferred reperfusion strategy when available within 90 minutes</li>
                    <li>Standard pharmacotherapy includes aspirin, P2Y12 inhibitor, and anticoagulation</li>
                    <li>Secondary prevention includes statins, beta-blockers, and ACE inhibitors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Virtual Patient Encounter</h1>
          <p className="text-muted-foreground">Interactive clinical decision-making exercise</p>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <HeartPulse className="mr-2 h-5 w-5 text-medblue-600" />
              Chest Pain Case Study
            </CardTitle>
            <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
            <Progress className="mt-2" value={progress} />
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleNext} 
              className="bg-medblue-600 hover:bg-medblue-700"
            >
              {currentStep < totalSteps ? "Next Step" : "Complete Case"} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Stethoscope className="mr-2 h-5 w-5 text-medblue-600" />
                More Clinical Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="p-2 hover:bg-slate-50 rounded flex justify-between items-center">
                  <span>Shortness of Breath</span>
                  <Button variant="outline" size="sm">Start</Button>
                </li>
                <li className="p-2 hover:bg-slate-50 rounded flex justify-between items-center">
                  <span>Abdominal Pain</span>
                  <Button variant="outline" size="sm">Start</Button>
                </li>
                <li className="p-2 hover:bg-slate-50 rounded flex justify-between items-center">
                  <span>Altered Mental Status</span>
                  <Button variant="outline" size="sm">Start</Button>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ClipboardCheck className="mr-2 h-5 w-5 text-medblue-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Cases Completed</span>
                    <span className="text-sm font-medium">1/12</span>
                  </div>
                  <Progress value={8.3} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Clinical Skills</span>
                    <span className="text-sm font-medium">Beginner</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Diagnostic Accuracy</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VirtualPatient;
