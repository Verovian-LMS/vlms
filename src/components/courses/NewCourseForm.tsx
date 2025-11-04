import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  CourseFormValues,
  courseFormSchema,
  courseCategories,
  courseLevels
} from "@/lib/validations/course";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { createCourse } from "@/lib/actions/course.actions";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Upload, Plus, Trash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface NewCourseFormProps {
  storageReady?: boolean;
}

const NewCourseForm: React.FC<NewCourseFormProps> = ({ 
  storageReady = true
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      category: courseCategories[0],
      level: courseLevels[0].toLowerCase() as "beginner" | "intermediate" | "advanced" | "expert",
      imageFile: null,
      imagePreview: null,
      modules: []
    },
    mode: "onChange",
  });

  const { mutate: createNewCourse, isPending: isCreating } = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      setError(null);
      console.log("Creating course with data:", values);
      return createCourse(values);
    },
    onSuccess: (data) => {
      console.log("Course created successfully:", data);
      toast({
        title: "Course created!",
        description: "You've successfully created a new course.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Error creating course:", error);
      setError(error.message || "Failed to create course. Please try again.");
      toast({
        title: "Something went wrong!",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadstart = () => {
        setUploadProgress(10);
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      reader.onload = (event) => {
        setUploadProgress(100);
        form.setValue("imagePreview", event.target?.result as string);
        resolve();
      };

      reader.onerror = (error) => {
        console.error("File reading error:", error);
        setUploadProgress(0);
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const onSubmit = (values: CourseFormValues) => {
    console.log("Form submitted with values:", values);
    createNewCourse(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!storageReady && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Storage Not Ready</AlertTitle>
            <AlertDescription>
              File uploads might not work because the required storage endpoints couldn't be accessed.
              You can still create a course, but you may need to add files later.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Basic Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Course Details</h2>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description (max 200 characters)" 
                      {...field} 
                      maxLength={200}
                    />
                  </FormControl>
                  <FormDescription>
                    This will appear in course listings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courseLevels.map((level) => (
                          <SelectItem key={level.toLowerCase()} value={level.toLowerCase()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Course Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
                      {form.watch("imagePreview") ? (
                        <div className="relative w-full">
                          <img 
                            src={form.watch("imagePreview")} 
                            alt="Course preview" 
                            className="w-full h-auto rounded-md object-cover max-h-[200px]"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              form.setValue("imageFile", null);
                              form.setValue("imagePreview", null);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-2">Click or drag to upload</p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                await handleImageUpload(file);
                              }
                            }}
                            {...fieldProps}
                          />
                        </>
                      )}
                      
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full mt-2">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-xs text-center mt-1">{uploadProgress}%</p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Right column - Detailed Description */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Detailed Information</h2>
            
            <FormField
              control={form.control}
              name="longDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed description of your course" 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include learning objectives, target audience, and what students will learn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Course Content</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Add module functionality would go here
                      toast({
                        title: "Coming Soon",
                        description: "Module creation will be available in the next update",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Module
                  </Button>
                </div>
                
                <div className="text-sm text-gray-500 p-4 text-center border border-dashed rounded-md">
                  {modules.length === 0 ? (
                    <p>No modules added yet. You can add modules after creating the course.</p>
                  ) : (
                    <div>Module list would appear here</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end mt-8">
          <Button 
            type="submit" 
            disabled={isCreating} 
            className="bg-medblue-600 hover:bg-medblue-700"
          >
            {isCreating ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewCourseForm;