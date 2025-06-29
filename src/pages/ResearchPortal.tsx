
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BookCopy, Search, FileText, BookOpen, Download, Star, FilterX, Clock, AlertCircle, 
  ArrowUpRight, Bookmark, ChevronRight, BarChart4, FilePen, Users 
} from "lucide-react";

const ResearchPortal = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string[]>([]);
  
  const toggleFilter = (filter: string) => {
    if (activeFilter.includes(filter)) {
      setActiveFilter(activeFilter.filter(f => f !== filter));
    } else {
      setActiveFilter([...activeFilter, filter]);
    }
  };
  
  const studyTypes = ["Randomized Controlled Trial", "Meta-Analysis", "Systematic Review", "Cohort Study", "Case-Control Study"];
  const specialties = ["Cardiology", "Neurology", "Oncology", "Pediatrics", "Surgery", "Primary Care"];
  const timeframes = ["Last week", "Last month", "Last 3 months", "Last year", "All time"];
  
  const articles = [
    {
      id: 1,
      title: "Efficacy of SGLT-2 Inhibitors in Heart Failure with Reduced Ejection Fraction: A Systematic Review and Meta-Analysis",
      authors: "Johnson MJ, Williams S, Chen H, et al.",
      journal: "Journal of the American Medical Association",
      publicationDate: "April 2024",
      type: "Meta-Analysis",
      specialty: "Cardiology",
      abstract: "Background: Sodium-glucose cotransporter-2 (SGLT-2) inhibitors have emerged as promising agents for heart failure treatment. This meta-analysis examined their efficacy in patients with heart failure with reduced ejection fraction (HFrEF)...",
      citations: 28,
      doi: "10.1001/jama.2024.4872"
    },
    {
      id: 2,
      title: "Long-term Outcomes of Immunotherapy Combined with Targeted Therapy in Advanced Melanoma",
      authors: "Rodriguez A, Smith JK, Patel R, et al.",
      journal: "New England Journal of Medicine",
      publicationDate: "March 2024",
      type: "Randomized Controlled Trial",
      specialty: "Oncology",
      abstract: "Background: The combination of immunotherapy and targeted therapy has shown promise in the treatment of advanced melanoma, but long-term outcomes remain unclear...",
      citations: 45,
      doi: "10.1056/NEJMoa2402231"
    },
    {
      id: 3,
      title: "Early Intervention Strategies for Autism Spectrum Disorder: A 10-Year Follow-up Study",
      authors: "Lee SM, Garcia JL, Iverson TS, et al.",
      journal: "Journal of Child Psychology and Psychiatry",
      publicationDate: "February 2024",
      type: "Cohort Study",
      specialty: "Pediatrics",
      abstract: "Background: Early intervention is considered crucial for children with autism spectrum disorder (ASD), but long-term follow-up data are limited...",
      citations: 19,
      doi: "10.1111/jcpp.13756"
    },
    {
      id: 4,
      title: "Point-of-Care Ultrasound for Diagnosis of Pneumonia in Primary Care Settings",
      authors: "Thompson K, Nguyen L, Alvarez M, et al.",
      journal: "Annals of Family Medicine",
      publicationDate: "January 2024",
      type: "Diagnostic Study",
      specialty: "Primary Care",
      abstract: "Background: Point-of-care ultrasound (POCUS) has potential utility in primary care settings, but its diagnostic accuracy for pneumonia compared to standard care requires further investigation...",
      citations: 11,
      doi: "10.1370/afm.2927"
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Research Portal</h1>
          <p className="text-muted-foreground">Access to latest medical literature and studies</p>
        </div>
        
        <div className="relative mb-8">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10" 
                placeholder="Search for articles, journals, authors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="bg-medblue-600 hover:bg-medblue-700">
              Search
            </Button>
          </div>
          
          {searchQuery && (
            <div className="absolute w-full bg-background border rounded-md mt-1 shadow-lg z-10 p-3">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Suggested searches</span>
                <Button variant="link" size="sm" className="h-auto p-0">
                  See all
                </Button>
              </div>
              <div className="space-y-1">
                {['SGLT-2 inhibitors heart failure', 'Melanoma immunotherapy', 'Autism early intervention'].map((suggestion, i) => (
                  <div 
                    key={i} 
                    className="flex items-center p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setActiveFilter([])}>
                  <FilterX className="h-3.5 w-3.5 mr-1" />
                  Clear all
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium mb-2">Study Type</h3>
                  <div className="space-y-2">
                    {studyTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={activeFilter.includes(type)}
                          onCheckedChange={() => toggleFilter(type)}
                        />
                        <label 
                          htmlFor={`type-${type}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Specialty</h3>
                  <div className="space-y-2">
                    {specialties.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`specialty-${specialty}`} 
                          checked={activeFilter.includes(specialty)}
                          onCheckedChange={() => toggleFilter(specialty)}
                        />
                        <label 
                          htmlFor={`specialty-${specialty}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {specialty}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Date Published</h3>
                  <div className="space-y-2">
                    {timeframes.map((timeframe) => (
                      <div key={timeframe} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`time-${timeframe}`} 
                          checked={activeFilter.includes(timeframe)}
                          onCheckedChange={() => toggleFilter(timeframe)}
                        />
                        <label 
                          htmlFor={`time-${timeframe}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {timeframe}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-medblue-600" />
                  Publication Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">New Articles Available</AlertTitle>
                  <AlertDescription className="text-xs">
                    8 new articles match your saved alerts
                  </AlertDescription>
                </Alert>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <span>Manage publication alerts</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="articles">
              <TabsList className="mb-6">
                <TabsTrigger value="articles" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Articles
                </TabsTrigger>
                <TabsTrigger value="journals" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Journals
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="articles" className="space-y-6">
                {articles.map((article) => (
                  <Card key={article.id} className="article-card">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold hover:text-medblue-600 cursor-pointer">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="mt-1">{article.authors}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{article.specialty}</Badge>
                        <Badge variant="outline">{article.type}</Badge>
                        <Badge variant="outline">{article.publicationDate}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{article.abstract}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookCopy className="h-4 w-4 mr-1" />
                        <span className="mr-4">{article.journal}</span>
                        <span className="mr-4">DOI: {article.doi}</span>
                        <span>Citations: {article.citations}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-1">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button className="bg-medblue-600 hover:bg-medblue-700" size="sm">
                        Read Full Article
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="journals">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Featured Medical Journals</CardTitle>
                      <CardDescription>
                        Browse the latest issues from top medical journals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: "New England Journal of Medicine", publisher: "Massachusetts Medical Society", impact: 91.2 },
                          { name: "The Lancet", publisher: "Elsevier", impact: 79.3 },
                          { name: "JAMA", publisher: "American Medical Association", impact: 56.3 },
                          { name: "BMJ", publisher: "BMJ Publishing Group", impact: 39.9 }
                        ].map((journal, i) => (
                          <Card key={i} className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="p-4">
                              <CardTitle className="text-base">{journal.name}</CardTitle>
                              <CardDescription className="text-xs">{journal.publisher}</CardDescription>
                              <div className="flex items-center mt-1">
                                <Star className="h-3 w-3 text-amber-500 mr-1" />
                                <span className="text-xs">Impact Factor: {journal.impact}</span>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="trending">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart4 className="h-5 w-5 mr-2 text-medblue-600" />
                      Trending Research Topics
                    </CardTitle>
                    <CardDescription>
                      The most discussed medical research topics this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { topic: "mRNA Vaccine Technology Applications", growth: "+218%", field: "Immunology", papers: 423 },
                        { topic: "AI in Diagnostic Radiology", growth: "+156%", field: "Medical Technology", papers: 287 },
                        { topic: "Gut Microbiome and Mental Health", growth: "+122%", field: "Gastroenterology/Psychiatry", papers: 194 },
                        { topic: "CAR-T Cell Therapy Advances", growth: "+98%", field: "Oncology", papers: 245 },
                        { topic: "Long COVID Mechanisms", growth: "+87%", field: "Infectious Disease", papers: 312 }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div>
                            <h3 className="font-medium">{item.topic}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <FilePen className="h-3 w-3 mr-1" />
                              <span>{item.papers} papers</span>
                              <span className="mx-2">•</span>
                              <span>{item.field}</span>
                            </div>
                          </div>
                          <div className="text-green-600 font-medium">
                            {item.growth}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Research Collaborations</CardTitle>
                    <CardDescription>
                      Find researchers and institutions for potential collaborations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Stanford Medical Research Group", focus: "Genomics & Precision Medicine", members: 78 },
                        { name: "Oxford Neuroscience Collaborative", focus: "Neurodegenerative Diseases", members: 64 },
                        { name: "Tokyo-Seoul Cancer Research Alliance", focus: "Novel Cancer Therapeutics", members: 92 }
                      ].map((group, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{group.name}</h3>
                              <div className="text-sm text-muted-foreground">{group.focus}</div>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{group.members} researchers</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Connect</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="saved">
                <div className="flex flex-col items-center justify-center py-12">
                  <BookCopy className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No saved articles yet</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Save interesting articles to read later by clicking the bookmark icon on any article.
                  </p>
                  <Button className="bg-medblue-600 hover:bg-medblue-700">
                    Browse Articles
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResearchPortal;
