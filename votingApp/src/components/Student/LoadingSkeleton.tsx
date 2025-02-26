// LoadingSkeleton.tsx
import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="skeleton h-8 sm:h-12 w-3/4 rounded mx-auto"></div>
      <div className="skeleton h-24 sm:h-32 w-full rounded-lg"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-48 sm:h-64 w-full rounded-lg"></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;