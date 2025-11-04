
import React from 'react';
import { UseFormReturn, useFormContext } from "react-hook-form";
import { CourseFormValues } from "@/lib/validations/course";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import RichTextEditor from "@/components/ui/rich-text-editor";

interface DetailedDescriptionStepProps {
  form: UseFormReturn<CourseFormValues>;
}

export const DetailedDescriptionStep: React.FC<DetailedDescriptionStepProps> = ({ form }) => {
  const formContext = useFormContext<CourseFormValues>();
  const activeForm = form || formContext;

  if (!activeForm || !activeForm.control) {
    return (
      <Card className="p-4 space-y-4">
        <h2 className="text-2xl font-bold font-heading">Detailed Description</h2>
        <div className="text-destructive text-sm">Form context is unavailable. Please try again.</div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-2xl font-bold font-heading">Detailed Description</h2>

      <FormField
        control={activeForm.control}
        name="longDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Detailed Course Description</FormLabel>
            <FormControl>
              <RichTextEditor
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="Provide a comprehensive description of your course"
                className="min-h-[200px]"
                ariaLabel="Detailed Course Description"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
};

export default DetailedDescriptionStep; // Add default export for backward compatibility
