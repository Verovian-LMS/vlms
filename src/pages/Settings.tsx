
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BellIcon, CircleUserRound, CreditCard, LogOut, MailIcon, Shield, User } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

const Settings = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile settings form
  const profileForm = useForm({
    defaultValues: {
      name: "Dr. Sarah Johnson",
      bio: "Educator with 10+ years of experience in teaching students. Passionate about innovative educational methods.",
      email: "sarah.johnson@example.com",
      institution: "University Learning Center",
      specialization: "Cardiology",
      website: "https://sarahjohnson.example.com"
    }
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailCourseUpdates: true,
    emailNewMessages: true,
    emailReminders: false,
    emailMarketing: false,
    browserNotifications: true
  });
  
  // Handle profile update
  const onProfileSubmit = (data: any) => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
      setIsUpdating(false);
    }, 1000);
  };
  
  // Handle notification settings update
  const handleNotificationChange = (field: keyof typeof notifications, value: boolean) => {
    setNotifications({
      ...notifications,
      [field]: value
    });
    
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved."
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    // In a real app, this would clear authentication state
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully."
    });
    
    // Navigate to login page
    // navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-slate-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading">Settings</h1>
            <p className="text-gray-600 mb-8 font-sans">Manage your account settings and preferences.</p>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <div className="lg:w-64">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center py-4">
                      <div className="w-24 h-24 rounded-full bg-medblue-100 flex items-center justify-center mb-3">
                        <CircleUserRound className="w-16 h-16 text-medblue-600" />
                      </div>
                      <h3 className="font-medium text-lg font-heading">Dr. Sarah Johnson</h3>
                      <p className="text-sm text-gray-500">Premium Member</p>
                      <Separator className="my-4 w-full" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content */}
              <div className="flex-1">
                <Tabs defaultValue="profile">
                  <TabsList className="mb-8">
                    <TabsTrigger value="profile" className="text-base">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="text-base">
                      <BellIcon className="w-4 h-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="text-base">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Billing
                    </TabsTrigger>
                    <TabsTrigger value="security" className="text-base">
                      <Shield className="w-4 h-4 mr-2" />
                      Security
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Profile Tab */}
                  <TabsContent value="profile">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your profile information visible to other users and students.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <FormField
                              control={profileForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="email" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="institution"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Institution/Organization</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={profileForm.control}
                                name="specialization"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Specialization</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="website"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="url" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={profileForm.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bio</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      className="min-h-[120px]"
                                      placeholder="Tell us about yourself"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Brief description visible on your profile and courses.
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-end">
                              <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? (
                                  <>
                                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Updating...
                                  </>
                                ) : (
                                  'Save Changes'
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Notifications Tab */}
                  <TabsContent value="notifications">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                          Control how you receive notifications and updates.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4 font-heading">Email Notifications</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Course Updates</p>
                                <p className="text-sm text-gray-500">Get notified when courses you're enrolled in are updated</p>
                              </div>
                              <Switch 
                                checked={notifications.emailCourseUpdates}
                                onCheckedChange={(checked) => handleNotificationChange('emailCourseUpdates', checked)}
                              />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">New Messages</p>
                                <p className="text-sm text-gray-500">Receive email notifications for new messages</p>
                              </div>
                              <Switch 
                                checked={notifications.emailNewMessages}
                                onCheckedChange={(checked) => handleNotificationChange('emailNewMessages', checked)}
                              />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Learning Reminders</p>
                                <p className="text-sm text-gray-500">Get reminders to continue your learning</p>
                              </div>
                              <Switch 
                                checked={notifications.emailReminders}
                                onCheckedChange={(checked) => handleNotificationChange('emailReminders', checked)}
                              />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Marketing Emails</p>
                                <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
                              </div>
                              <Switch 
                                checked={notifications.emailMarketing}
                                onCheckedChange={(checked) => handleNotificationChange('emailMarketing', checked)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 font-heading">Browser Notifications</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Enable Browser Notifications</p>
                                <p className="text-sm text-gray-500">Show notifications in your browser</p>
                              </div>
                              <Switch 
                                checked={notifications.browserNotifications}
                                onCheckedChange={(checked) => handleNotificationChange('browserNotifications', checked)}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Billing Tab */}
                  <TabsContent value="billing">
                    <Card>
                      <CardHeader>
                        <CardTitle>Subscription & Billing</CardTitle>
                        <CardDescription>
                          Manage your subscription and payment information.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-6 bg-medblue-50 rounded-lg border border-medblue-100 mb-6">
                          <h3 className="text-lg font-medium mb-2 text-medblue-700 font-heading">Premium Plan</h3>
                          <p className="text-medblue-600 mb-3">Your subscription renews on August 15, 2025</p>
                          <div className="flex gap-3">
                            <Button variant="outline" size="sm">Change Plan</Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              Cancel Subscription
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-medium mb-4 font-heading">Payment Method</h3>
                        <div className="flex items-center justify-between p-4 border rounded-md mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-6 bg-blue-600 rounded mr-3"></div>
                            <div>
                              <p className="font-medium">Visa ending in 4242</p>
                              <p className="text-sm text-gray-500">Expires 09/2026</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Update</Button>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Security Tab */}
                  <TabsContent value="security">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>
                          Manage your account security and password.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4 font-heading">Change Password</h3>
                          <div className="space-y-4">
                            <div>
                              <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
                              <Input id="currentPassword" type="password" />
                            </div>
                            
                            <div>
                              <FormLabel htmlFor="newPassword">New Password</FormLabel>
                              <Input id="newPassword" type="password" />
                              <FormDescription>
                                Password must be at least 8 characters and include one number, one uppercase letter,
                                and one special character.
                              </FormDescription>
                            </div>
                            
                            <div>
                              <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
                              <Input id="confirmPassword" type="password" />
                            </div>
                            
                            <Button>Update Password</Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 font-heading">Two-Factor Authentication</h3>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium">Enable Two-Factor Authentication</p>
                              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                            <Switch />
                          </div>
                          <Button variant="outline">
                            <Shield className="w-4 h-4 mr-2" />
                            Setup 2FA
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 text-red-600 font-heading">Danger Zone</h3>
                          <div className="p-4 border border-red-200 rounded-md bg-red-50">
                            <p className="font-medium text-red-600 mb-2">Delete Account</p>
                            <p className="text-sm text-red-500 mb-4">
                              Once you delete your account, there is no going back. This action is permanent.
                            </p>
                            <Button variant="destructive" size="sm">Delete Account</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
