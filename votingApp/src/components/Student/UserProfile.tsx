// UserProfile.tsx
import React from 'react';
import { User, Check, RefreshCw } from 'lucide-react';

interface UserProfileProps {
  studentEmail: string;
  hasVoted: boolean;
  votedTeam: string | null;
  resetVote: () => Promise<void>;
  error: string;
  setError: (error: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  studentEmail, 
  hasVoted, 
  votedTeam, 
  resetVote, 
  
}) => {
  return (
    <div className="card mb-6 sm:mb-8 bg-base-100 shadow-lg">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="flex items-center text-sm sm:text-base break-all">
            <User className="min-w-4 h-4 sm:h-5 sm:w-5 mr-2 text-primary shrink-0" />
            <span className="truncate">{studentEmail}</span>
          </span>
          {hasVoted && (
            <div className="badge badge-outline text-primary self-start sm:self-auto">
              <Check className="mr-1 h-3 w-3" /> Voted
            </div>
          )}
        </div>
        <p className="text-sm sm:text-base text-base-content/70 mt-2">
          {hasVoted 
            ? `You have voted for: ${votedTeam}`
            : "Please select a team to vote"
          }
        </p>
        {hasVoted && (
          <div className="card-actions justify-start mt-4">
            <button 
              className="btn btn-outline btn-sm" 
              onClick={resetVote}
              aria-label="Change vote"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Change Vote
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;