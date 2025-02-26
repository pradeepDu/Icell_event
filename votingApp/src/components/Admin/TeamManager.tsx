import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { VoteStats } from '../../utils/types';
import gsap from 'gsap';

interface TeamManagerProps {
  teams: string[];
  voteStats: VoteStats[];
  onError: (message: string) => void;
  refreshData: () => Promise<void>;
}

const TeamManager: React.FC<TeamManagerProps> = ({
  teams,
  voteStats,
  onError,
  refreshData
}) => {
  const [newTeam, setNewTeam] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const teamListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.3, ease: "power2.out" }
      );
    }
    
    if (teamListRef.current && teamListRef.current.children.length > 0) {
      gsap.fromTo(
        teamListRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, delay: 0.6, ease: "back.out(1.4)" }
      );
    }
  }, [teams]);

  // Helper function to get vote count for a team
  const getVoteCount = (teamName: string): number => {
    const teamStats = voteStats.find(stat => stat.teamName === teamName);
    return teamStats ? teamStats.votes : 0;
  };

  // Add new team
  const addTeam = async () => {
    if (newTeam && !teams.includes(newTeam)) {
      try {
        const payload = {
          name: `${newTeam} Team Created`,
          post: 'Administrative Entry',
          teamName: newTeam,
          isLeader: false,
          teamId: newTeam.toLowerCase().replace(/\s+/g, '-')
        };
        
        await axios.post('http://localhost:5000/team-members', payload);
        
        // Add animation for success
        if (cardRef.current) {
          gsap.fromTo(
            cardRef.current,
            { borderColor: "#10b981" },
            { borderColor: "transparent", duration: 1, ease: "power2.out" }
          );
        }
        
        // Refresh the data to get the updated teams list
        await refreshData();
        setNewTeam('');
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error('Error details:', err.response?.data);
          onError(err.response?.data?.error || 'Failed to create team');
        } else {
          onError('Failed to create team');
        }
      }
    } else if (teams.includes(newTeam)) {
      onError('Team already exists');
    }
  };
  
  // Remove a team and its members
  const removeTeam = async (teamName: string) => {
    try {
      setIsDeleting(teamName);
      
      // Animate removal
      const teamElement = document.getElementById(`team-${teamName.replace(/\s+/g, '-')}`);
      if (teamElement) {
        await gsap.to(teamElement, {
          opacity: 0,
          x: -30,
          duration: 0.3,
          ease: "power1.in"
        });
      }
      
      // Get all team members including hidden ones
      const response = await axios.get('/team-members');
      const allMembers = response.data;
      const teamMembers = allMembers.filter((member: any) => member.teamName === teamName);
      
      for (const member of teamMembers) {
        await axios.delete(`/team-members/${member._id}`);
      }
      
      refreshData();
      setIsDeleting(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        onError(err.response?.data?.error || 'Failed to remove team');
      } else {
        onError('Failed to remove team');
      }
      setIsDeleting(null);
    }
  };

  return (
    <div ref={cardRef} className="card bg-base-100 shadow-xl h-full">
      <div className="card-body">
        <h2 className="card-title text-xl">Team Management</h2>
        
        {/* Add New Team */}
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-2">Add New Team</h3>
          <div className="join w-full">
            <input
              type="text"
              className="input input-bordered join-item flex-grow"
              placeholder="Team Name"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
            />
            <button
              className="btn btn-primary join-item"
              onClick={addTeam}
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Team List */}
        <div>
          <h3 className="font-medium text-lg mb-2">Teams</h3>
          {teams.length > 0 ? (
            <ul ref={teamListRef} className="divide-y">
              {teams.map((team, index) => (
                <li 
                  key={index} 
                  id={`team-${team.replace(/\s+/g, '-')}`}
                  className="py-3 flex justify-between items-center"
                >
                  <span className="font-medium">{team}</span>
                  <div className="flex items-center">
                    <span className="badge badge-neutral mr-2">
                      {getVoteCount(team)} votes
                    </span>
                    <button
                      className="btn btn-error btn-sm btn-outline"
                      onClick={() => removeTeam(team)}
                      disabled={isDeleting === team}
                    >
                      {isDeleting === team ? 
                        <span className="loading loading-spinner loading-xs"></span> : 
                        "Delete"
                      }
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>No teams available. Add your first team above.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManager;