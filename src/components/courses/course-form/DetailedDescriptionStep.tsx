
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "@/lib/validations/course";
import { Textarea } from "@/components/ui/textarea";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";

interface DetailedDescriptionStepProps {
  form: UseFormReturn<CourseFormValues>;
}

export const DetailedDescriptionStep: React.FC<DetailedDescriptionStepProps> = ({ form }) => {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold font-heading">Detailed Description</h2>

      <FormField
        control={form.control}
        name="longDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Detailed Course Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide a comprehensive description of your course"
                className="min-h-[200px]"
                {...field}
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
