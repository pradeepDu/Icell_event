import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { TeamMember, NewMember } from '../../utils/types';
import { gsap } from 'gsap';

interface MemberManagerProps {
  teams: string[];
  members: TeamMember[];
  onError: (message: string) => void;
  refreshData: () => Promise<void>;
}

const MemberManager: React.FC<MemberManagerProps> = ({
  teams,
  members,
  onError,
  refreshData
}) => {
  const [newMember, setNewMember] = useState<NewMember>({
    name: '',
    post: '',
    teamName: '',
    isLeader: false,
  });

  const memberListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(memberListRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 });
  }, [members]);

  // Add a new team member
  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/team-members', newMember);
      setNewMember({ name: '', post: '', teamName: '', isLeader: false });
      refreshData();
    } catch (err) {
      onError(axios.isAxiosError(err) ? err.response?.data?.error || 'Failed to add member' : 'Failed to add member');
    }
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">Team Member Management</h2>
      
      {/* Add Team Member Form */}
      <form onSubmit={addTeamMember} className="mb-6 space-y-3">
        <input type="text" placeholder="Name" value={newMember.name} 
          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
          className="input input-bordered w-full" required />
        
        <input type="text" placeholder="Position" value={newMember.post}
          onChange={(e) => setNewMember({ ...newMember, post: e.target.value })}
          className="input input-bordered w-full" required />
        
        <select value={newMember.teamName} 
          onChange={(e) => setNewMember({ ...newMember, teamName: e.target.value })} 
          className="select select-bordered w-full" required>
          <option value="">Select Team</option>
          {teams.map((team, index) => (
            <option key={index} value={team}>{team}</option>
          ))}
        </select>
        
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={newMember.isLeader} 
            onChange={(e) => setNewMember({ ...newMember, isLeader: e.target.checked })} 
            className="checkbox checkbox-primary" />
          <span>Team Leader</span>
        </label>

        <button type="submit" className="btn btn-success w-full">Add Member</button>
      </form>
      
      {/* Team Members List */}
      <div ref={memberListRef} className="overflow-hidden">
        <h3 className="text-lg font-medium mb-2 text-center">Current Team Members</h3>
        {members.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member._id} className="py-3 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">
                    {member.post} - {member.teamName}
                    {member.isLeader && (
                      <span className="ml-2 badge badge-warning text-xs">Leader</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="btn btn-outline btn-info btn-sm">{member.isLeader ? 'Remove Leader' : 'Make Leader'}</button>
                  <button className="btn btn-outline btn-error btn-sm">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No team members available</p>
        )}
      </div>
    </div>
  );
};

export default MemberManager;
