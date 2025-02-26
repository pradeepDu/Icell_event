// ErrorAlert.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
  onClose: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
  if (!error) return null;
  
  return (
    <div className="alert alert-error mb-4 sm:mb-6 shadow-lg animate-fadeIn text-sm sm:text-base">
      <div className="flex items-start sm:items-center">
        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 mt-0.5 sm:mt-0" />
        <div className="ml-2">
          <h3 className="font-bold">Error</h3>
          <div className="text-xs sm:text-sm">{error}</div>
        </div>
      </div>
      <button 
        className="btn btn-circle btn-xs ml-auto" 
        onClick={onClose}
        aria-label="Close error message"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorAlert;