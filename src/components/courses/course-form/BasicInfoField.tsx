
import React from 'react';
import { Label } from '@/components/ui/label';

interface BasicInfoFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

const BasicInfoField: React.FC<BasicInfoFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  children
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-heading font-semibold text-slate-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {helpText && (
        <p className="text-xs text-slate-500 font-exo2">{helpText}</p>
      )}
    </div>
  );
};

export default BasicInfoField;
