import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { VotingPeriod, NewVotingPeriod } from '../../utils/types';
import gsap from 'gsap';

interface VotingPeriodManagerProps {
  activePeriod: VotingPeriod | null;
  votingPeriods: VotingPeriod[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  refreshData: () => Promise<void>;
}

const VotingPeriodManager: React.FC<VotingPeriodManagerProps> = ({
  activePeriod,
  votingPeriods,
  onSuccess,
  onError,
  refreshData
}) => {
  const [newVotingPeriod, setNewVotingPeriod] = useState<NewVotingPeriod>({
    name: '',
    endDate: ''
  });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" }
      );
    }
    
    if (formRef.current) {
      gsap.fromTo(
        formRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.6, ease: "power1.out" }
      );
    }
    
    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: 1, ease: "power2.out" }
      );
    }
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate time remaining for active voting period
  const getTimeRemaining = () => {
    if (!activePeriod) return null;
    
    const endTime = new Date(activePeriod.endDate).getTime();
    const now = new Date().getTime();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) {
      return 'Voting period has ended';
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  // Create a new voting period and reset votes
  const createVotingPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newVotingPeriod.endDate) {
        onError('End date is required');
        return;
      }
      
      await axios.post('/voting-period', newVotingPeriod);
      setNewVotingPeriod({ name: '', endDate: '' });
      onSuccess('New voting period created and all votes have been reset');
      refreshData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        onError(err.response?.data?.error || 'Failed to create voting period');
      } else {
        onError('Failed to create voting period');
      }
    }
  };

  return (
    <div ref={cardRef} className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body">
        <h2 className="card-title text-xl">Voting Period Management</h2>
        
        {/* Active Voting Period Status */}
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-2">Current Voting Status</h3>
          {activePeriod ? (
            <div className="alert alert-info shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="font-bold">{activePeriod.name}</h3>
                <div className="text-sm">Start: {formatDate(activePeriod.startDate)}</div>
                <div className="text-sm">End: {formatDate(activePeriod.endDate)}</div>
                <div className="mt-2 font-medium">{getTimeRemaining()}</div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>No active voting period. Create one below to allow students to vote.</span>
            </div>
          )}
        </div>
        
        {/* Create New Voting Period Form */}
        <form ref={formRef} onSubmit={createVotingPeriod} className="mb-6">
          <h3 className="font-medium text-lg mb-2">Create New Voting Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Period Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g., Spring 2025 Elections"
                value={newVotingPeriod.name}
                onChange={(e) => setNewVotingPeriod({...newVotingPeriod, name: e.target.value})}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">End Date & Time</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={newVotingPeriod.endDate}
                onChange={(e) => setNewVotingPeriod({...newVotingPeriod, endDate: e.target.value})}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Start New Voting Period & Reset All Votes
          </button>
          <div className="alert alert-warning mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>This will end any active voting period and reset all votes!</span>
          </div>
        </form>
        
        {/* Voting Period History */}
        <div ref={tableRef}>
          <h3 className="font-medium text-lg mb-2">Voting Period History</h3>
          {votingPeriods.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {votingPeriods.map((period) => (
                    <tr key={period._id} className="hover">
                      <td>{period.name}</td>
                      <td>{formatDate(period.startDate)}</td>
                      <td>{formatDate(period.endDate)}</td>
                      <td>
                        {period.active ? (
                          <div className="badge badge-success gap-2">Active</div>
                        ) : (
                          <div className="badge badge-ghost gap-2">Ended</div>
                        )}
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
              <span>No voting periods yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPeriodManager;