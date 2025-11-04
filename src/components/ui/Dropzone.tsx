import React, { useRef } from 'react';
import { Upload, CheckCircle2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFilesSelected: (files: FileList | File[]) => void;
  previewUrl?: string | null;
  progress?: number; // overall progress 0-100
  onRemove?: () => void;
  label?: string;
  helperText?: string;
  className?: string;
}

const Dropzone: React.FC<DropzoneProps> = ({
  accept,
  multiple = false,
  disabled = false,
  onFilesSelected,
  previewUrl,
  progress = 0,
  onRemove,
  label = 'Click or drag files to upload',
  helperText,
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  const openFileDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors group ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary hover:bg-slate-50'} border-slate-300`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) openFileDialog(); }}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative inline-block group">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 w-auto object-contain rounded-md mx-auto shadow-md"
            />
            {progress >= 100 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-green-700 text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Upload complete</span>
              </div>
            )}
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <Upload className="w-12 h-12 mb-3 text-primary/50 group-hover:text-primary" />
            <span className="text-sm font-medium font-exo2">{label}</span>
            {helperText && (
              <span className="text-xs mt-1 text-slate-400 font-exo2">{helperText}</span>
            )}
            <div className="mt-3">
              <Button type="button" variant="outline" disabled={disabled} onClick={openFileDialog}>
                Browse Files
              </Button>
            </div>
          </div>
        )}

        {progress > 0 && progress < 100 && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <div className="text-xs text-slate-500 mt-1">{progress}%</div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Dropzone;