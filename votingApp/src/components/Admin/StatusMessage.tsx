import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface StatusMessageProps {
  error: string;
  success: string;
  clearError: () => void;
  clearSuccess: () => void;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  error,
  success,
  clearError,
  clearSuccess
}) => {
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [error]);

  useEffect(() => {
    if (success && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [success]);

  return (
    <>
      {error && (
        <div ref={errorRef} className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button className="btn btn-circle btn-xs" onClick={clearError}>×</button>
        </div>
      )}
      
      {success && (
        <div ref={successRef} className="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
          <button className="btn btn-circle btn-xs" onClick={clearSuccess}>×</button>
        </div>
      )}
    </>
  );
};

export default StatusMessage;
