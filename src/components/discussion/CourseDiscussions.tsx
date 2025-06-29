
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import {
  MessageCircle,
  Search,
  Plus,
  MessageSquare,
  Filter,
  SortAsc,
  Pin,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

type Discussion = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_pinned: boolean;
  is_closed: boolean;
  created_by: string;
  post_count?: number;
  creator?: {
    name: string;
    avatar: string;
  };
};

const DiscussionCard: React.FC<{
  discussion: Discussion;
  onClick: () => void;
}> = ({ discussion, onClick }) => {
  const formattedDate = formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true });
  const initials = discussion.creator?.name
    ? discussion.creator.name.split(" ").map(n => n[0]).join("")
    : "?";

  return (
    <Card className="mb-4 cursor-pointer hover:border-medblue-200 transition-all" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={discussion.creator?.avatar} />
            <AvatarFallback className="bg-medblue-100 text-medblue-600">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold font-nunito flex items-center">
                {discussion.is_pinned && <Pin className="h-4 w-4 mr-1 text-amber-500" />}
                {discussion.title}
              </h3>
              <div className="flex space-x-2">
                {discussion.is_closed && (
                  <Badge variant="outline" className="text-xs border-slate-200">Closed</Badge>
                )}
                <Badge variant="secondary" className="flex items-center text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" /> 
                  {discussion.post_count || 0}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2 font-exo2">{discussion.description}</p>
            <div className="flex items-center mt-3 text-xs text-gray-500">
              <User className="h-3 w-3 mr-1" />
              <span className="mr-3">{discussion.creator?.name || "Unknown"}</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseDiscussions: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDiscussions = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('discussions')
          .select(`
            id, 
            title, 
            description,
            created_at,
            is_pinned,
            is_closed,
            created_by,
            profiles:created_by (
              name,
              avatar
            )
          `)
          .eq('course_id', courseId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching discussions:', error);
          toast({
            title: "Error",
            description: "Failed to load course discussions",
            variant: "destructive"
          });
          return;
        }
        
        // For each discussion, get the count of posts
        if (data) {
          const discussionsWithCounts = await Promise.all(
            data.map(async (discussion) => {
              const { count, error: countError } = await supabase
                .from('discussion_posts')
                .select('id', { count: 'exact', head: true })
                .eq('discussion_id', discussion.id);
                
              if (countError) {
                console.error('Error counting posts:', countError);
                return {
                  ...discussion,
                  creator: discussion.profiles,
                  post_count: 0
                };
              }
              
              return {
                ...discussion,
                creator: discussion.profiles,
                post_count: count || 0
              };
            })
          );
          
          setDiscussions(discussionsWithCounts);
        }
      } catch (error) {
        console.error('Error in fetchDiscussions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, [courseId, toast]);

  const handleCreateTopic = async () => {
    if (!isAuthenticated || !courseId) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create topics",
        variant: "destructive"
      });
      return;
    }
    
    if (!newTitle.trim() || !newDescription.trim()) {
      toast({
        title: "Incomplete form",
        description: "Please provide both a title and description",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert({
          title: newTitle.trim(),
          description: newDescription.trim(),
          course_id: courseId,
          created_by: user?.id
        })
        .select(`
          id, 
          title, 
          description,
          created_at,
          is_pinned,
          is_closed,
          created_by,
          profiles:created_by (
            name,
            avatar
          )
        `)
        .single();
        
      if (error) {
        console.error('Error creating topic:', error);
        toast({
          title: "Error",
          description: "Failed to create new topic",
          variant: "destructive"
        });
        return;
      }
      
      // Add the new topic to the list
      if (data) {
        setDiscussions(prevDiscussions => [{
          ...data,
          creator: data.profiles,
          post_count: 0
        }, ...prevDiscussions]);
        
        setNewTopicOpen(false);
        setNewTitle("");
        setNewDescription("");
        
        toast({
          title: "Topic created",
          description: "Your new discussion topic has been created",
        });
      }
    } catch (error) {
      console.error('Error in handleCreateTopic:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDiscussions = discussions.filter(
    discussion => 
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigateToDiscussion = (discussionId: string) => {
    // This will be implemented in a future update
    toast({
      title: "Coming Soon",
      description: "Individual discussion view will be available in the next update",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h2 className="text-2xl font-bold font-nunito">Course Discussions</h2>
        
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 font-exo2"
            />
          </div>
          
          <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-nunito">Create New Discussion Topic</DialogTitle>
                <DialogDescription className="font-exo2">
                  Start a new conversation with your classmates about this course.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="topic-title" className="text-sm font-medium font-nunito">
                    Title
                  </label>
                  <Input
                    id="topic-title"
                    placeholder="Topic title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="font-exo2"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="topic-description" className="text-sm font-medium font-nunito">
                    Description
                  </label>
                  <Textarea
                    id="topic-description"
                    placeholder="Describe your topic in detail"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="min-h-[120px] font-exo2"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setNewTopicOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTopic}
                  disabled={isSubmitting || !newTitle.trim() || !newDescription.trim()}
                >
                  {isSubmitting ? "Creating..." : "Create Topic"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 font-exo2">
          {filteredDiscussions.length} {filteredDiscussions.length === 1 ? 'topic' : 'topics'}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-xs h-8">
            <SortAsc className="h-3 w-3 mr-1" /> Sort
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Filter className="h-3 w-3 mr-1" /> Filter
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="mb-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 mt-3">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDiscussions.length > 0 ? (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onClick={() => navigateToDiscussion(discussion.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
          <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 font-nunito">No discussions yet</h3>
          <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto font-exo2">
            Be the first to start a discussion about this course. Ask questions, share insights, or connect with fellow students.
          </p>
          <Button 
            className="mt-4"
            onClick={() => setNewTopicOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Start a Discussion
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseDiscussions;
