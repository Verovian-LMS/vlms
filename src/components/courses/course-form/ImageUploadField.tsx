
import React from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadFieldProps {
  imagePreview: string | null;
  onImageSelect: () => void;
  onImageRemove: () => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  imagePreview,
  onImageSelect,
  onImageRemove
}) => {
  return (
    <div
      className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors group"
      onClick={onImageSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onImageSelect(); }}
    >
      {imagePreview ? (
        <div className="relative inline-block group">
          <img
            src={imagePreview}
            alt="Course preview"
            className="max-h-48 w-auto object-contain rounded-md mx-auto shadow-md"
          />
          {/* Remove Button */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onImageRemove();
            }}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Placeholder when no image is selected
        <div className="flex flex-col items-center justify-center text-slate-500">
          <Upload className="w-12 h-12 mb-3 text-primary/50 group-hover:text-primary" />
          <span className="text-sm font-medium font-exo2">Click or drag file to upload</span>
          <span className="text-xs mt-1 text-slate-400 font-exo2">Recommended size: 800×450 pixels</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
