import React, { useEffect, useRef } from 'react';
import { VoteStats } from '../../utils/types';
import gsap from 'gsap';

interface Props {
  voteStats: VoteStats[];
}

const VoteStatistics: React.FC<Props> = ({ voteStats }) => {
  const statRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statRef.current) {
      gsap.fromTo(
        statRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  // Calculate total votes
  const totalVotes = voteStats.reduce((sum, team) => sum + team.votes, 0);

  return (
    <div ref={statRef} className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body">
        <h2 className="card-title text-xl">Vote Statistics</h2>
        
        {voteStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Votes</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {voteStats.map((team, index) => (
                  <tr key={index} className="hover">
                    <td>{team.teamName}</td>
                    <td>{team.votes}</td>
                    <td>
                      {totalVotes > 0 ? (
                        <div className="flex items-center gap-2">
                          <span>{((team.votes / totalVotes) * 100).toFixed(1)}%</span>
                          <progress 
                            className="progress progress-primary w-24" 
                            value={(team.votes / totalVotes) * 100} 
                            max="100"
                          ></progress>
                        </div>
                      ) : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No votes recorded yet</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteStatistics;