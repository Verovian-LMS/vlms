
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import BasicInfoField from './course-form/BasicInfoField';
import ImageUploadField from './course-form/ImageUploadField';

interface CourseBasicInfoProps {
  title: string;
  description: string;
  longDescription: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  image: File | null;
  imagePreview: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLongDescriptionChange: (value: string) => void;
  onLevelChange: (value: 'beginner' | 'intermediate' | 'advanced') => void;
  onCategoryChange: (value: string) => void;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  isStep1Valid: boolean;
  setStep: (value: number) => void;
}

export const CourseBasicInfo: React.FC<CourseBasicInfoProps> = ({
  title,
  description,
  longDescription,
  level,
  category,
  image,
  imagePreview,
  onTitleChange,
  onDescriptionChange,
  onLongDescriptionChange,
  onLevelChange,
  onCategoryChange,
  onImageChange,
  isStep1Valid,
  setStep
}) => {
  // Define course categories
  const categories = [
    { value: "anatomy", label: "Anatomy" },
    { value: "physiology", label: "Physiology" },
    { value: "biochemistry", label: "Biochemistry" },
    { value: "pathology", label: "Pathology" },
    { value: "pharmacology", label: "Pharmacology" },
    { value: "microbiology", label: "Microbiology" },
    { value: "clinical-skills", label: "Clinical Skills" },
    { value: "radiology", label: "Radiology" },
    { value: "ethics", label: "Medical Ethics" },
  ];

  // Handler for when a new file is selected
  const handleImageSelect = () => {
    document.getElementById('image-upload')?.click();
  };
  
  // Handler for image input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Revoke previous URL if it exists and is a blob URL to prevent memory leaks
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      // Create a new preview URL and update the parent state
      const objectUrl = URL.createObjectURL(file);
      onImageChange(file, objectUrl);

      // Clear the input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  // Handler for removing the selected image
  const handleImageRemove = () => {
    // Revoke URL if it's a blob URL
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    // Update parent state, clearing both file and preview
    onImageChange(null, null);
  };

  return (
    <Card className="w-full border-none shadow-md">
      <CardHeader className="bg-white rounded-t-xl pb-2">
        <CardTitle className="text-2xl font-heading font-bold text-slate-800">Course Information</CardTitle>
        <CardDescription>Add the basic details of your course</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* --- Title Field --- */}
        <BasicInfoField 
          id="course-title" 
          label="Course Title" 
          required
          helpText="A concise and descriptive title for your course."
        >
          <Input
            id="course-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., Introduction to Cardiovascular Physiology"
            maxLength={100}
            className="h-11 font-exo2"
            required
          />
        </BasicInfoField>

        {/* --- Short Description Field --- */}
        <BasicInfoField 
          id="course-description" 
          label="Short Description" 
          required
          helpText="Max 250 characters."
        >
          <Textarea
            id="course-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="A brief summary (1-2 sentences) that appears in course listings."
            rows={2}
            maxLength={250}
            className="resize-none font-exo2"
            required
          />
        </BasicInfoField>

        {/* --- Level & Category Row --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Level Select */}
          <BasicInfoField 
            id="course-level" 
            label="Course Level" 
            required
          >
            <Select value={level} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => onLevelChange(value)} required>
              <SelectTrigger id="course-level" className="h-11 font-exo2">
                <SelectValue placeholder="Select course level" />
              </SelectTrigger>
              <SelectContent className="font-exo2">
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </BasicInfoField>

          {/* Category Select */}
          <BasicInfoField 
            id="course-category" 
            label="Category" 
            required
          >
            <Select value={category} onValueChange={onCategoryChange} required>
              <SelectTrigger id="course-category" className="h-11 font-exo2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="font-exo2">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BasicInfoField>
        </div>

        {/* --- Long Description Field --- */}
        <BasicInfoField 
          id="course-long-description" 
          label="Detailed Description" 
          helpText="Use markdown for formatting if supported."
        >
          <Textarea
            id="course-long-description"
            value={longDescription}
            onChange={(e) => onLongDescriptionChange(e.target.value)}
            placeholder="Provide a full description covering course content, learning objectives, target audience, prerequisites, etc."
            rows={6}
            className="font-exo2"
          />
        </BasicInfoField>

        {/* --- Image Upload Field --- */}
        <BasicInfoField 
          id="image-upload-button" 
          label="Course Image" 
          helpText="Upload a high-quality image that represents your course (JPG, PNG, WebP)."
        >
          <ImageUploadField
            imagePreview={imagePreview}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
          />
          {/* Hidden actual file input */}
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg, image/png, image/webp, image/gif"
            className="hidden"
            onChange={handleImageChange}
          />
        </BasicInfoField>

        {/* --- Continue Button --- */}
        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            aria-disabled={!isStep1Valid}
            className="font-heading font-bold px-8 py-3 h-auto"
          >
            Continue to Course Content
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
