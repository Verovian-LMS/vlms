
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Brain, Send, BookOpen, Clock, BarChart, History, Loader2, Sparkles } from "lucide-react";

const AiTutor = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<{role: "user" | "assistant", content: string, timestamp: Date}[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI tutor. How can I help you with your studies today?",
      timestamp: new Date()
    }
  ]);
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message to conversation
    const newMessage = {
      role: "user" as const,
      content: message,
      timestamp: new Date()
    };
    
    setConversation([...conversation, newMessage]);
    setMessage("");
    setLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great question! The cardiac cycle consists of systole and diastole phases. During systole, the ventricles contract to eject blood, while in diastole, the ventricles relax and fill with blood. The heart sounds S1 and S2 mark the beginning of systole and diastole respectively.",
        "Let me explain that for you. In the respiratory system, gas exchange occurs through diffusion. Oxygen moves from areas of high concentration (alveoli) to areas of low concentration (capillary blood), while carbon dioxide moves in the opposite direction.",
        "To understand this better, think of the kidney's nephron as a filtering unit. It first filters blood at the glomerulus, then selectively reabsorbs essential substances and secretes waste products as the filtrate moves through the tubule system.",
        "The answer is in the mechanism of action. Beta-blockers work by blocking the effects of epinephrine (adrenaline), slowing the heart rate and reducing blood pressure. They're commonly used to treat hypertension, angina, and heart failure.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiResponse = {
        role: "assistant" as const,
        content: randomResponse,
        timestamp: new Date()
      };
      
      setConversation([...conversation, newMessage, aiResponse]);
      setLoading(false);
    }, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">AI-Powered Tutoring</h1>
          <p className="text-muted-foreground">Personalized learning assistance for education</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-280px)] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-medblue-600" />
                  AI Tutor Conversation
                </CardTitle>
                <CardDescription>Ask questions about topics, case studies, or exam preparation</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {conversation.map((msg, index) => (
                      <div 
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`flex max-w-[80%] ${
                            msg.role === "user" 
                              ? "flex-row-reverse" 
                              : "flex-row"
                          }`}
                        >
                          <Avatar className={`h-8 w-8 ${msg.role === "user" ? "ml-2" : "mr-2"}`}>
                            <AvatarImage src={msg.role === "assistant" ? "/placeholder.svg" : undefined} />
                            <AvatarFallback>
                              {msg.role === "user" ? "U" : "AI"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div 
                              className={`rounded-lg p-3 ${
                                msg.role === "user" 
                                  ? "bg-medblue-600 text-white" 
                                  : "bg-muted"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="flex max-w-[80%] flex-row">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="rounded-lg p-3 bg-muted">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="pt-4">
                <div className="flex w-full items-center space-x-2">
                  <Input 
                    placeholder="Type your question about topics..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!message.trim() || loading}
                    className="bg-medblue-600 hover:bg-medblue-700"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-medblue-600" />
                  AI Tutor Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-medblue-600" />
                    <span>Interactive studying</span>
                  </li>
                  <li className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-medblue-600" />
                    <span>Knowledge assessment</span>
                  </li>
                  <li className="flex items-center">
                    <History className="h-4 w-4 mr-2 text-medblue-600" />
                    <span>Conversation history</span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-medblue-600" />
                    <span>24/7 availability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Suggested Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    className="cursor-pointer bg-medblue-100 text-medblue-800 hover:bg-medblue-200"
                    onClick={() => {
                      setMessage("Explain the cardiac cycle and heart sounds");
                    }}
                  >
                    Cardiac cycle
                  </Badge>
                  <Badge 
                    className="cursor-pointer bg-medblue-100 text-medblue-800 hover:bg-medblue-200"
                    onClick={() => {
                      setMessage("How does the nephron work?");
                    }}
                  >
                    Nephron function
                  </Badge>
                  <Badge 
                    className="cursor-pointer bg-medblue-100 text-medblue-800 hover:bg-medblue-200"
                    onClick={() => {
                      setMessage("Explain the mechanism of action for beta-blockers");
                    }}
                  >
                    Beta-blockers
                  </Badge>
                  <Badge 
                    className="cursor-pointer bg-medblue-100 text-medblue-800 hover:bg-medblue-200"
                    onClick={() => {
                      setMessage("Describe the process of gas exchange in the lungs");
                    }}
                  >
                    Gas exchange
                  </Badge>
                  <Badge 
                    className="cursor-pointer bg-medblue-100 text-medblue-800 hover:bg-medblue-200"
                    onClick={() => {
                      setMessage("What are the causes of acute pancreatitis?");
                    }}
                  >
                    Pancreatitis
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Study Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Study Session Started",
                        description: "Science basics session has been started",
                      });
                    }}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Science Basics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Study Session Started",
                        description: "Research methods review session has been started",
                      });
                    }}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Research Methods Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AiTutor;
