import React from 'react';
import { UseFormReturn, useFormContext } from "react-hook-form";
import { CourseFormValues } from "@/lib/validations/course";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courseCategories, courseLevels } from "@/lib/validations/course";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ImageUploadField from "./ImageUploadField";

interface BasicInfoStepProps {
  form: UseFormReturn<CourseFormValues>;
  uploadProgress?: number;
  onImageUpload: (file: File) => Promise<void>;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ 
  form, 
  uploadProgress = 0, 
  onImageUpload 
}) => {
  // Add form context as a backup in case form prop is not provided
  const formContext = useFormContext<CourseFormValues>();
  const activeForm = form || formContext;
  
  console.log("BasicInfoStep rendering with form state:", {
    hasForm: !!activeForm,
    isValid: activeForm?.formState.isValid,
    errors: activeForm?.formState.errors,
    values: activeForm?.getValues()
  });
  
  if (!activeForm || !activeForm.control) {
    console.error("Form context is missing in BasicInfoStep");
    return (
      <Card className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There was an error loading the form. Please refresh the page.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-heading">Basic Information</h2>

        <ErrorBoundary>
          <FormField
            control={activeForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course title" {...field} />
                </FormControl>
                <FormDescription>
                  Must be at least 5 characters long
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <FormField
            control={activeForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief overview of the course"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Must be at least 20 characters long
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <FormField
            control={activeForm.control}
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
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose a category that best fits your course
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <FormField
            control={activeForm.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseLevels.map(level => (
                      <SelectItem key={level} value={level.toLowerCase()}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the difficulty level of your course
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <FormField
            control={activeForm.control}
            name="imagePreview"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Image</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <ImageUploadField
                      imagePreview={field.value}
                      uploadProgress={uploadProgress}
                      onImageSelect={() => {
                        document.getElementById("course-image-input")?.click();
                      }}
                      onImageRemove={() => {
                        activeForm.setValue("imageFile", null);
                        activeForm.setValue("imagePreview", null);
                      }}
                      onFileDrop={(file) => {
                        activeForm.setValue("imageFile", file);
                        onImageUpload(file);
                      }}
                    />
                    {/* Hidden input to support file picker */}
                    <input
                      id="course-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          activeForm.setValue("imageFile", file);
                          onImageUpload(file);
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Upload a cover image for your course
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </ErrorBoundary>
      </div>
    </Card>
  );
};

export default BasicInfoStep;
