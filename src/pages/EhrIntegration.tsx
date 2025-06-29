
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileSpreadsheet, Database, Check, X, ShieldCheck, Building2, 
  Brain, Heart, Stethoscope, FileWarning, Clock, Users, CheckCircle2,
  UserCircle, Clipboard, BookText, PlusCircle, FileUp, BarChart4, FileText
} from "lucide-react";

const EhrIntegration = () => {
  const { toast } = useToast();
  const [integratedSystem, setIntegratedSystem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("patients");
  
  const handleIntegrate = (system: string) => {
    toast({
      title: "Integration Started",
      description: `Connecting to ${system}...`,
    });
    
    // Simulate integration process
    setTimeout(() => {
      setIntegratedSystem(system);
      toast({
        title: "Integration Complete",
        description: `Successfully connected to ${system}.`,
      });
    }, 2000);
  };
  
  const PatientCard = ({ patient }: { patient: typeof patients[0] }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="mb-1">{patient.name}</CardTitle>
              <CardDescription>
                {patient.age} years • {patient.gender} • MRN: {patient.mrn}
              </CardDescription>
            </div>
          </div>
          <Badge variant={patient.status === "Active" ? "default" : "outline"}>
            {patient.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs text-muted-foreground">Primary Diagnosis</Label>
            <div className="text-sm font-medium">{patient.diagnosis}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Last Visit</Label>
            <div className="text-sm font-medium">{patient.lastVisit}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Provider</Label>
            <div className="text-sm font-medium">{patient.provider}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Insurance</Label>
            <div className="text-sm font-medium">{patient.insurance}</div>
          </div>
        </div>
        
        <div className="flex space-x-1 mb-2">
          {patient.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-0">
        <Button variant="outline" size="sm" className="mr-2">
          <FileText className="h-4 w-4 mr-1" />
          Notes
        </Button>
        <Button className="bg-medblue-600 hover:bg-medblue-700" size="sm">
          <UserCircle className="h-4 w-4 mr-1" />
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
  
  const patients = [
    {
      id: 1,
      name: "Robert Thompson",
      age: 67,
      gender: "Male",
      mrn: "MRN78902",
      diagnosis: "Hypertension, Type 2 Diabetes",
      lastVisit: "Apr 5, 2025",
      provider: "Dr. Sarah Williams",
      insurance: "Medicare",
      status: "Active",
      tags: ["Cardiology", "Endocrinology"]
    },
    {
      id: 2,
      name: "Maria Garcia",
      age: 42,
      gender: "Female",
      mrn: "MRN65432",
      diagnosis: "Migraine, Anxiety",
      lastVisit: "Mar 28, 2025",
      provider: "Dr. James Chen",
      insurance: "Blue Cross",
      status: "Active",
      tags: ["Neurology", "Psychiatry"]
    },
    {
      id: 3,
      name: "David Johnson",
      age: 58,
      gender: "Male",
      mrn: "MRN34567",
      diagnosis: "COPD, Osteoarthritis",
      lastVisit: "Feb 12, 2025",
      provider: "Dr. Lisa Patel",
      insurance: "Aetna",
      status: "Inactive",
      tags: ["Pulmonology", "Orthopedics"]
    }
  ];
  
  const ehrSystems = [
    {
      name: "Epic Systems",
      description: "Comprehensive health records system used by many large healthcare organizations",
      features: ["Clinical documentation", "Order entry", "Population health"],
      icon: <FileSpreadsheet className="h-8 w-8" />
    },
    {
      name: "Cerner",
      description: "Integrated EHR solution with strong clinical decision support",
      features: ["Clinical workflows", "Medication management", "Interoperability"],
      icon: <Database className="h-8 w-8" />
    },
    {
      name: "Athenahealth",
      description: "Cloud-based EHR with focus on practice management",
      features: ["Billing integration", "Patient engagement", "Mobile access"],
      icon: <Building2 className="h-8 w-8" />
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Electronic Medical Record Integration</h1>
          <p className="text-muted-foreground">
            Connect to your healthcare organization's EMR system to enhance your learning experience
          </p>
        </div>
        
        {!integratedSystem ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
                  Secure Integration
                </CardTitle>
                <CardDescription>
                  MedMaster uses secure, HIPAA-compliant connections to integrate with your EMR system. 
                  Patient data is encrypted and never stored on our servers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Role-based access controls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>HIPAA compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Audit logging</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>De-identified data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>SOC 2 Type II certified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ehrSystems.map((system) => (
                <Card key={system.name} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-md">
                        {system.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{system.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-4">{system.description}</p>
                    <div className="space-y-2">
                      {system.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-sm">
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-medblue-600 hover:bg-medblue-700"
                      onClick={() => handleIntegrate(system.name)}
                    >
                      Connect to {system.name}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Custom EMR Integration</CardTitle>
                <CardDescription>
                  Don't see your EMR system listed? Contact us for custom integration options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input placeholder="Organization Name" className="flex-grow" />
                  <Input placeholder="EMR System" className="flex-grow" />
                  <Button>Request Integration</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  Successfully Connected
                </CardTitle>
                <CardDescription className="text-green-700">
                  Your MedMaster account is now connected to {integratedSystem}. You can now access patient 
                  records, clinical cases, and practice documentation within the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-md">
                    <Building2 className="h-8 w-8 text-medblue-600" />
                  </div>
                  <div>
                    <div className="font-medium">University Medical Center</div>
                    <div className="text-sm text-muted-foreground">
                      Last synced: April 10, 2025 at 10:23 AM
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Sync Now
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="patients" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 md:w-[600px]">
                <TabsTrigger value="patients" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Patients
                </TabsTrigger>
                <TabsTrigger value="cases" className="flex items-center">
                  <Clipboard className="mr-2 h-4 w-4" />
                  Clinical Cases
                </TabsTrigger>
                <TabsTrigger value="practice" className="flex items-center">
                  <BookText className="mr-2 h-4 w-4" />
                  Documentation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="patients" className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input 
                        placeholder="Search patients..." 
                        className="pl-10 w-full md:w-80"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Patients</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-medblue-600 hover:bg-medblue-700">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
                
                <div className="space-y-4 mt-4">
                  {patients.map((patient) => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="cases" className="space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Clinical Case Library</h3>
                  <Button className="bg-medblue-600 hover:bg-medblue-700">
                    <FileUp className="h-4 w-4 mr-2" />
                    Import New Case
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { 
                      title: "Acute Myocardial Infarction", 
                      description: "62-year-old male with chest pain radiating to the left arm",
                      specialty: "Cardiology",
                      complexity: "High",
                      icon: <Heart className="h-8 w-8 text-red-500" />
                    },
                    { 
                      title: "Ischemic Stroke", 
                      description: "78-year-old female with sudden onset right-sided weakness",
                      specialty: "Neurology",
                      complexity: "High",
                      icon: <Brain className="h-8 w-8 text-blue-500" />
                    },
                    { 
                      title: "Community-Acquired Pneumonia", 
                      description: "45-year-old male with fever, cough, and dyspnea",
                      specialty: "Pulmonology",
                      complexity: "Medium",
                      icon: <Stethoscope className="h-8 w-8 text-green-500" />
                    },
                    { 
                      title: "Diabetic Ketoacidosis", 
                      description: "22-year-old female with Type 1 diabetes presenting with vomiting",
                      specialty: "Endocrinology",
                      complexity: "High",
                      icon: <FileWarning className="h-8 w-8 text-amber-500" />
                    },
                    { 
                      title: "Urinary Tract Infection", 
                      description: "34-year-old female with dysuria and frequency",
                      specialty: "Urology",
                      complexity: "Low",
                      icon: <Stethoscope className="h-8 w-8 text-purple-500" />
                    },
                    { 
                      title: "Asthma Exacerbation", 
                      description: "12-year-old male with wheezing and shortness of breath",
                      specialty: "Pediatrics",
                      complexity: "Medium",
                      icon: <Stethoscope className="h-8 w-8 text-teal-500" />
                    }
                  ].map((caseItem, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="p-2 bg-muted rounded-md">
                            {caseItem.icon}
                          </div>
                          <Badge variant="outline">{caseItem.complexity}</Badge>
                        </div>
                        <CardTitle className="mt-2 text-base">{caseItem.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {caseItem.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Badge variant="secondary">{caseItem.specialty}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="practice" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart4 className="h-5 w-5 mr-2 text-medblue-600" />
                      Documentation Metrics
                    </CardTitle>
                    <CardDescription>
                      Track your documentation skills and progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Note Completeness</Label>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Coding Accuracy</Label>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Clinical Decision Documentation</Label>
                          <span className="text-sm font-medium">64%</span>
                        </div>
                        <Progress value={64} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-medblue-600" />
                            Avg. Completion Time
                          </CardTitle>
                          <CardDescription>14 minutes</CardDescription>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-medblue-600" />
                            Notes Completed
                          </CardTitle>
                          <CardDescription>42 notes</CardDescription>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Quality Score
                          </CardTitle>
                          <CardDescription>86/100</CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Practice Documentation</CardTitle>
                      <CardDescription>
                        Improve your clinical documentation skills with practice exercises
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          "SOAP Note Writing", 
                          "Admission H&P", 
                          "Discharge Summary",
                          "Consultation Note"
                        ].map((exercise, i) => (
                          <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                            <span>{exercise}</span>
                            <Button variant="outline" size="sm">Start</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Documentation Templates</CardTitle>
                      <CardDescription>
                        Access specialty-specific templates to improve efficiency
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          "Internal Medicine Progress Note", 
                          "Cardiology Consultation", 
                          "Pediatric Well Visit",
                          "Emergency Department Evaluation"
                        ].map((template, i) => (
                          <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                            <span>{template}</span>
                            <Button variant="outline" size="sm">Use</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

const Search = ({ className, ...props }: React.ComponentProps<typeof Search>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-search", className)}
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default EhrIntegration;
