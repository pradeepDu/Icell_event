// TeamCard.tsx
import React from 'react';
import { Users, Check } from 'lucide-react';
import { Team } from '../../utils/student';
import { getTeamColor } from '../../utils/teamUtils';

interface TeamCardProps {
  team: Team;
  hasVoted: boolean;
  votedTeam: string | null;
  submitVote: (teamName: string) => Promise<void>;
  setRef: (el: HTMLDivElement | null) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  hasVoted, 
  votedTeam, 
  submitVote,
  setRef 
}) => {
  const isVotedTeam = hasVoted && votedTeam === team.name;
  
  return (
    <div 
      className={`card bg-base-100 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isVotedTeam ? 'ring-2 ring-success' : ''
      }`}
      ref={setRef}
    >
      <div className={`h-2 ${getTeamColor(team.name)}`} />
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="card-title text-lg sm:text-xl">{team.name}</h2>
          {!hasVoted ? (
            <button 
              onClick={() => submitVote(team.name)}
              className="btn btn-primary btn-sm sm:btn-md self-start"
              aria-label={`Vote for ${team.name}`}
            >
              Vote
            </button>
          ) : votedTeam === team.name ? (
            <div className="badge badge-success gap-1 self-start">
              <Check className="h-3 w-3" /> Your Vote
            </div>
          ) : null}
        </div>
        
        <div className="space-y-4 mt-4">
          {team.leader && <TeamLeader leader={team.leader} />}
          <TeamMembers members={team.members.filter(member => 
            !member.isLeader && 
            !member.name.includes("Team Created") && 
            member.post !== "Administrative Entry"
          )} />
        </div>
      </div>
    </div>
  );
};

interface Leader {
  name: string;
  post: string;
}

const TeamLeader: React.FC<{ leader: Leader }> = ({ leader }) => (
  <div className="p-3 sm:p-4 rounded-lg bg-base-200">
    <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center text-primary">
      <Users className="mr-2 h-4 w-4" />
      Team Leader
    </h3>
    <div className="flex items-center">
      <div className="avatar mr-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold">
            {leader.name.charAt(0)}
          </span>
        </div>
      </div>
      <div>
        <p className="font-medium text-sm sm:text-base">{leader.name}</p>
        <p className="text-xs text-base-content/60">{leader.post}</p>
      </div>
    </div>
  </div>
);

interface Member {
  _id: string;
  name: string;
  post: string;
  isLeader: boolean;
}

const TeamMembers: React.FC<{ members: Member[] }> = ({ members }) => (
  <div>
    <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center">
      <Users className="mr-2 h-4 w-4" />
      Team Members
    </h3>
    {members.length > 0 ? (
      <ul className="space-y-2">
        {members.map(member => (
          <li key={member._id} className="p-2 rounded-lg hover:bg-base-200 transition-colors">
            <div className="flex items-center">
              <div className="avatar mr-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-base-300 flex items-center justify-center">
                  <span className="text-base-content font-medium text-xs sm:text-sm">
                    {member.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{member.name}</p>
                <p className="text-xs text-base-content/60 truncate">{member.post}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-base-content/50 italic text-center py-4 text-sm">No team members yet</p>
    )}
  </div>
);

export default TeamCard;