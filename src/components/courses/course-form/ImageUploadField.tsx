
import React from 'react';
import Dropzone from '@/components/ui/Dropzone';

interface ImageUploadFieldProps {
  imagePreview: string | null;
  onImageSelect: () => void;
  onImageRemove: () => void;
  onFileDrop?: (file: File) => void;
  uploadProgress?: number;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  imagePreview,
  onImageSelect,
  onImageRemove,
  onFileDrop,
  uploadProgress = 0
}) => {
  return (
    <Dropzone
      accept="image/*"
      multiple={false}
      previewUrl={imagePreview}
      progress={uploadProgress}
      onRemove={onImageRemove}
      label="Click or drag file to upload"
      helperText="Recommended size: 800×450 pixels"
      onFilesSelected={(files) => {
        const file = Array.isArray(files) ? (files[0] as File) : files[0];
        if (file && onFileDrop) {
          onFileDrop(file);
        } else {
          // Fallback to existing onImageSelect to trigger external input if provided
          onImageSelect?.();
        }
      }}
    />
  );
};

export default ImageUploadField;
