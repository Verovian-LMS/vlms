
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Flag, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/context/FastApiAuthContext";
import { useToast } from "@/hooks/use-toast";

interface DiscussionComment {
  id: string;
  user_id: string;
  discussion_id: string;
  content: string;
  created_at: string;
  parent_id?: string;
  user: {
    name: string;
    avatar?: string;
  };
  replies?: DiscussionComment[];
}

interface LessonDiscussionProps {
  lessonId: string;
}

const LessonDiscussion: React.FC<LessonDiscussionProps> = ({ lessonId }) => {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch discussions and comments for this lesson
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        setDiscussions([]);
        setComments([]);
        toast({
          title: "Coming Soon",
          description: "Lesson discussions are being migrated and are temporarily unavailable.",
        });
      } catch (error) {
        console.error('Error in fetchDiscussions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [lessonId, user, isAuthenticated]);
  
  const fetchCommentsForDiscussion = async (_discussionId: string) => {
    setComments([]);
  };
  
  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to participate in discussions.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (discussions.length === 0) {
        toast({
          title: "No discussion available",
          description: "No discussion thread exists for this lesson yet.",
          variant: "destructive",
        });
        return;
      }
      
      const discussionId = discussions[0].id;
      
      toast({
        title: "Feature unavailable",
        description: "Posting comments is temporarily disabled during migration.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error in handleSubmitComment:', error);
    }
  };
  
  const handleSubmitReply = async () => {
    if (!isAuthenticated || !replyingTo) {
      return;
    }
    
    if (!replyContent.trim()) {
      toast({
        title: "Empty reply",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get the discussion ID from the comment that's being replied to
      const parentComment = comments.find(c => c.id === replyingTo);
      if (!parentComment) return;
      
      toast({
        title: "Feature unavailable",
        description: "Replying is temporarily disabled during migration.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error in handleSubmitReply:', error);
    }
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-nunito-sans">Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div className="mb-8">
            <Textarea
              placeholder="Share your thoughts or questions about this lesson..."
              className="resize-none mb-4 font-exo2"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment}>Post Comment</Button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-md mb-8 text-center">
            <p className="text-gray-600 mb-2 font-exo2">Please sign in to join the discussion.</p>
            <Button variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        )}

        {comments.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-700 font-nunito-sans">No comments yet</h3>
            <p className="text-gray-500 font-exo2">Be the first to share your thoughts</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-6 last:border-b-0">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={comment.user?.avatar} alt={comment.user?.name} />
                    <AvatarFallback>{comment.user?.name?.substring(0, 2) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold font-nunito-sans">{comment.user?.name || "Anonymous"}</h4>
                        <p className="text-gray-500 text-sm font-exo2">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 text-gray-800 font-exo2">
                      {comment.content}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Like
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </div>

                    {/* Reply form */}
                    {replyingTo === comment.id && isAuthenticated && (
                      <div className="mt-4 ml-6">
                        <Textarea
                          placeholder="Write a reply..."
                          className="resize-none mb-2 font-exo2"
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSubmitReply}>
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reply.user?.avatar} alt={reply.user?.name} />
                              <AvatarFallback>{reply.user?.name?.substring(0, 2) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold font-nunito-sans">{reply.user?.name || "Anonymous"}</h5>
                                <span className="text-gray-500 text-xs font-exo2">
                                  {new Date(reply.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-800 font-exo2">{reply.content}</p>
                              <div className="mt-1 flex gap-2">
                                <Button variant="ghost" size="sm" className="h-6 text-xs">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Like
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 text-xs">
                                  <Flag className="h-3 w-3 mr-1" />
                                  Report
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <p className="text-gray-500 text-sm font-exo2">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </p>
        {comments.length > 5 && (
          <Button variant="outline">Load more comments</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default LessonDiscussion;
