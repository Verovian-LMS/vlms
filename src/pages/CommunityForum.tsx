
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { Heart, MessageSquare, Eye, Globe, UserPlus, Flag, Plus, HeartHandshake, Users, ThumbsUp, Search } from "lucide-react";

const CommunityForum = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("latest");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  
  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your post.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Post created",
      description: "Your discussion has been posted to the forum.",
    });
    
    setNewPostTitle("");
    setNewPostContent("");
    setOpenDialog(false);
  };
  
  const discussionPosts = [
    {
      id: 1,
      title: "Approaches to teaching respiratory examination to first-year students?",
      author: "Dr. Sarah Johnson",
      authorRole: "Associate Professor",
      location: "Toronto, Canada",
      postedTime: "2 hours ago",
      content: "I've been looking for innovative ways to teach respiratory examination techniques to first-year medical students. Traditional methods aren't engaging them well. Has anyone incorporated technology or simulation successfully?",
      likes: 24,
      comments: 8,
      views: 156,
      tags: ["Teaching", "Clinical Skills", "Respiratory"]
    },
    {
      id: 2,
      title: "Recent advances in targeted therapy for metastatic colorectal cancer",
      author: "Dr. Miguel Fernandez",
      authorRole: "Oncologist",
      location: "Barcelona, Spain",
      postedTime: "5 hours ago",
      content: "I'd like to discuss the latest research on targeted therapies for metastatic colorectal cancer, particularly focusing on EGFR, VEGF, and BRAF inhibitors. What are your experiences with the newer agents?",
      likes: 32,
      comments: 15,
      views: 247,
      tags: ["Oncology", "Research", "Colorectal Cancer", "Targeted Therapy"]
    },
    {
      id: 3,
      title: "Managing physician burnout in high-stress settings",
      author: "Dr. Amara Okafor",
      authorRole: "Emergency Physician",
      location: "Lagos, Nigeria",
      postedTime: "1 day ago",
      content: "Burnout is becoming increasingly common among physicians in my hospital, especially in emergency medicine. What strategies have been effective in your institutions for recognizing and addressing burnout?",
      likes: 87,
      comments: 42,
      views: 523,
      tags: ["Physician Wellness", "Burnout", "Healthcare Management"]
    },
    {
      id: 4,
      title: "Using AI for medical image analysis - ethical considerations",
      author: "Dr. Hiroshi Tanaka",
      authorRole: "Radiologist",
      location: "Tokyo, Japan",
      postedTime: "2 days ago",
      content: "As AI becomes more prevalent in radiology, I'm concerned about some ethical implications. How are others addressing issues of algorithm bias, responsibility for missed diagnoses, and patient privacy?",
      likes: 56,
      comments: 27,
      views: 349,
      tags: ["AI", "Ethics", "Radiology", "Technology"]
    }
  ];
  
  const trendingTopics = ["Medical Education", "COVID-19 Research", "AI in Healthcare", "Physician Wellness", "Global Health Equity"];
  
  const DiscussionPost = ({ post }: { post: typeof discussionPosts[0] }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-semibold">{post.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span>{post.author}</span>
                <span className="mx-1">•</span>
                <span>{post.authorRole}</span>
                <span className="mx-1">•</span>
                <span>{post.postedTime}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Globe className="h-3 w-3 mr-1" />
                <span>{post.location}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{post.content}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex space-x-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Heart className="h-4 w-4 mr-1" />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            {post.comments}
          </Button>
          <div className="flex items-center text-muted-foreground text-sm">
            <Eye className="h-4 w-4 mr-1" />
            {post.views}
          </div>
        </div>
        <Button variant="outline" size="sm">
          Reply
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Global Community Forum</h1>
            <p className="text-muted-foreground">Connect with medical professionals worldwide</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-medblue-600 hover:bg-medblue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create a New Discussion</DialogTitle>
                  <DialogDescription>
                    Share your thoughts, questions, or insights with the medical community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input 
                      id="title" 
                      placeholder="What's your discussion about?" 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">Content</label>
                    <Textarea 
                      id="content" 
                      placeholder="Share your thoughts, questions or insights..." 
                      rows={6}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="tags" className="text-sm font-medium">Tags (optional)</label>
                    <Input id="tags" placeholder="e.g., Research, Cardiology, Education" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button className="bg-medblue-600" onClick={handleCreatePost}>Post Discussion</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Find Colleagues
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <Tabs defaultValue="latest" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="latest">Latest</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
                
                <div className="relative ml-auto mt-4 sm:mt-0">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    placeholder="Search discussions..." 
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </Tabs>
            </div>
            
            <div className="space-y-4">
              {discussionPosts.map(post => (
                <DiscussionPost key={post.id} post={post} />
              ))}
              
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <HeartHandshake className="mr-2 h-5 w-5 text-medblue-600" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-medblue-600" />
                    <span>Members</span>
                  </div>
                  <span className="font-semibold">24,568</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-medblue-600" />
                    <span>Discussions</span>
                  </div>
                  <span className="font-semibold">7,432</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-medblue-600" />
                    <span>Countries</span>
                  </div>
                  <span className="font-semibold">102</span>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">
                  Join the conversation with medical professionals from around the world.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{topic}</span>
                      </div>
                      <ThumbsUp className="h-4 w-4 text-medblue-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Featured Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Dr. Emily Chen", role: "Neurologist", location: "Boston, USA" },
                    { name: "Dr. Amir Patel", role: "Cardiologist", location: "London, UK" },
                    { name: "Dr. Maria Santos", role: "Pediatrician", location: "São Paulo, Brazil" }
                  ].map((member, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.role} • {member.location}</div>
                      </div>
                    </div>
                  ))}
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

export default CommunityForum;
