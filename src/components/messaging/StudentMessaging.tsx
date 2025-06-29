
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  User, 
  Search,  
  MessageSquare, 
  Users
} from "lucide-react";
import { format } from "date-fns";

type Contact = {
  id: string;
  name: string;
  avatar: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  is_read: boolean;
};

const StudentMessaging: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch user's contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        // Find all users the current user has exchanged messages with
        const { data: sentMessages, error: sentError } = await supabase
          .from('messages')
          .select('recipient_id')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });
          
        const { data: receivedMessages, error: receivedError } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });
          
        if (sentError || receivedError) {
          console.error('Error fetching messages:', sentError || receivedError);
          return;
        }
        
        // Get unique user IDs
        const senderIds = receivedMessages?.map(msg => msg.sender_id) || [];
        const recipientIds = sentMessages?.map(msg => msg.recipient_id) || [];
        const uniqueUserIds = [...new Set([...senderIds, ...recipientIds])].filter(Boolean);
        
        if (uniqueUserIds.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Fetch user profiles for these IDs
        const { data: userProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .in('id', uniqueUserIds);
          
        if (profilesError) {
          console.error('Error fetching user profiles:', profilesError);
          return;
        }
        
        // For each contact, get their last message and unread count
        const contactsWithMeta = await Promise.all((userProfiles || []).map(async (profile) => {
          // Get the last message between current user and this contact
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('messages')
            .select('content, created_at, is_read')
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          // Get count of unread messages from this contact
          const { count: unreadCount, error: countError } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('sender_id', profile.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false);
            
          if (lastMessageError || countError) {
            console.error('Error fetching message metadata:', lastMessageError || countError);
          }
          
          return {
            id: profile.id,
            name: profile.name || 'Unknown User',
            avatar: profile.avatar || '',
            last_message: lastMessageData?.content,
            last_message_time: lastMessageData?.created_at,
            unread_count: unreadCount || 0
          };
        }));
        
        // Sort contacts by last message time
        contactsWithMeta.sort((a, b) => {
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });
        
        setContacts(contactsWithMeta);
        
        // If we have contacts, select the first one
        if (contactsWithMeta.length > 0 && !selectedContact) {
          setSelectedContact(contactsWithMeta[0]);
        }
      } catch (error) {
        console.error('Error in fetchContacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchContacts();
    }
  }, [user?.id, isAuthenticated, selectedContact]);

  // Fetch messages when a contact is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id || !selectedContact) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .or(`sender_id.eq.${selectedContact.id},recipient_id.eq.${selectedContact.id}`)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching messages:', error);
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive"
          });
          return;
        }
        
        setMessages(data || []);
        
        // Mark messages as read
        if (data) {
          const unreadMessageIds = data
            .filter(msg => msg.sender_id === selectedContact.id && !msg.is_read)
            .map(msg => msg.id);
            
          if (unreadMessageIds.length > 0) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', unreadMessageIds);
              
            // Update unread count in contacts
            setContacts(prevContacts => 
              prevContacts.map(contact => 
                contact.id === selectedContact.id
                  ? { ...contact, unread_count: 0 }
                  : contact
              )
            );
          }
        }
      } catch (error) {
        console.error('Error in fetchMessages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedContact) {
      fetchMessages();
    }
  }, [user?.id, selectedContact, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!isAuthenticated || !selectedContact || !newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: selectedContact.id,
          content: newMessage.trim(),
          is_read: false
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
        return;
      }
      
      // Add the new message to the list
      if (data) {
        setMessages(prevMessages => [...prevMessages, data]);
        
        // Update the contact's last message
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === selectedContact.id
              ? { 
                  ...contact, 
                  last_message: data.content,
                  last_message_time: data.created_at
                }
              : contact
          ).sort((a, b) => {
            if (!a.last_message_time) return 1;
            if (!b.last_message_time) return -1;
            return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
          })
        );
        
        setNewMessage("");
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const filteredContacts = contacts.filter(
    contact => contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, "h:mm a");
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-xl font-semibold font-nunito">Sign in to access messaging</h2>
        <p className="mt-2 text-slate-600 font-exo2">You need to be logged in to message other students</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
        {/* Contacts sidebar */}
        <div className="border-r border-slate-200">
          <div className="p-4">
            <h2 className="text-lg font-semibold font-nunito mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-medblue-600" /> Conversations
            </h2>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 font-exo2"
              />
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="p-1">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-slate-50' : ''
                    }`}
                    onClick={() => selectContact(contact)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback className="bg-medblue-100 text-medblue-600">
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium font-nunito truncate">{contact.name}</h4>
                        {contact.unread_count ? (
                          <Badge className="ml-2 bg-medblue-500">{contact.unread_count}</Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500 truncate font-exo2">
                        {contact.last_message || "No messages yet"}
                      </p>
                      {contact.last_message_time && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatMessageDate(contact.last_message_time)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <User className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-600 font-exo2">No contacts found</p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message area */}
        <div className="md:col-span-2 flex flex-col h-full">
          {selectedContact ? (
            <>
              {/* Contact header */}
              <div className="p-4 border-b border-slate-200 flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback className="bg-medblue-100 text-medblue-600">
                    {selectedContact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-md font-semibold font-nunito">{selectedContact.name}</h3>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                          <Skeleton className={`h-16 w-48 rounded-lg ${i % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'}`} />
                          <Skeleton className="h-3 w-24 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isMe = message.sender_id === user?.id;
                      const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                      
                      return (
                        <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && showAvatar && (
                            <Avatar className="h-8 w-8 mr-2 mt-1">
                              <AvatarImage src={selectedContact.avatar} />
                              <AvatarFallback className="bg-medblue-100 text-medblue-600">
                                {selectedContact.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[80%] ${!isMe && !showAvatar ? 'ml-10' : ''}`}>
                            <div 
                              className={`p-3 rounded-lg ${
                                isMe 
                                  ? 'bg-medblue-500 text-white rounded-tr-none' 
                                  : 'bg-slate-100 text-slate-900 rounded-tl-none'
                              }`}
                            >
                              <p className="text-sm font-exo2">{message.content}</p>
                            </div>
                            <p className={`text-xs mt-1 ${isMe ? 'text-right' : ''} text-slate-500`}>
                              {formatMessageDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-6">
                      <MessageSquare className="mx-auto h-12 w-12 text-slate-200 mb-2" />
                      <h4 className="text-sm font-semibold text-slate-600 font-nunito">No messages yet</h4>
                      <p className="text-xs text-slate-500 mt-1 font-exo2">Send a message to start the conversation</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t border-slate-200">
                <form 
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                >
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="resize-none font-exo2"
                    rows={2}
                  />
                  <Button 
                    type="submit"
                    className="self-end"
                    disabled={!newMessage.trim() || isSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <MessageSquare className="mx-auto h-16 w-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 font-nunito">No conversation selected</h3>
                <p className="text-slate-500 mt-1 font-exo2">Select a contact to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMessaging;
