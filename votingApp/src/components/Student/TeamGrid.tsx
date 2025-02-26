// TeamGrid.tsx
import React from 'react';
import { Team } from '../../utils/student';
import TeamCard from './TeamCard';

interface TeamGridProps {
    teams: Team[];
    hasVoted: boolean;
    votedTeam: string | null;
    submitVote: (teamName: string) => Promise<void>;
    teamsRef: React.RefObject<HTMLDivElement | null>;
    setTeamCardRef: (index: number) => (el: HTMLDivElement | null) => void;
  }
const TeamGrid: React.FC<TeamGridProps> = ({ 
  teams, 
  hasVoted, 
  votedTeam, 
  submitVote, 
  teamsRef,
  setTeamCardRef
}) => {
  return (
    <div ref={teamsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {teams.map((team, index) => (
        <TeamCard
          key={index}
          team={team}
          hasVoted={hasVoted}
          votedTeam={votedTeam}
          submitVote={submitVote}
          setRef={setTeamCardRef(index)}
        />
      ))}
    </div>
  );
};

export default TeamGrid;