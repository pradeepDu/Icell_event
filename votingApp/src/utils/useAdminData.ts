import { useState, useEffect } from 'react';
import axios from 'axios';
import { TeamMember, VoteStats, VotingPeriod } from './types';
import { useAuth } from '../context/AuthContext';

export const useAdminData = () => {
  const { isAdmin } = useAuth();
  const [teams, setTeams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [voteStats, setVoteStats] = useState<VoteStats[]>([]);
  const [activePeriod, setActivePeriod] = useState<VotingPeriod | null>(null);
  const [votingPeriods, setVotingPeriods] = useState<VotingPeriod[]>([]);
  
  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch team members
      const membersResponse = await axios.get('/team-members');
      
      // Filter out hidden administrative entries for display
      const visibleMembers = membersResponse.data.filter((member: TeamMember) => !member.isHidden);
      setMembers(visibleMembers);

      // Extract unique team names from all members (including hidden ones)
      const uniqueTeams = [...new Set(membersResponse.data.map((member: { teamName: string }) => member.teamName))] as string[];
      setTeams(uniqueTeams);

      // Fetch vote statistics using our new endpoint
      const voteStatsResponse = await axios.get('/votes/count');
      setVoteStats(voteStatsResponse.data);
      
      // Fetch active voting period
      try {
        const activePeriodResponse = await axios.get('/voting-period/active');
        setActivePeriod(activePeriodResponse.data);
      } catch (err) {
        // No active period found, that's okay
        setActivePeriod(null);
      }
      
      // Fetch voting period history
      const votingHistoryResponse = await axios.get('/voting-period/history');
      setVotingPeriods(votingHistoryResponse.data);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to fetch data');
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  return {
    teams,
    members,
    voteStats,
    activePeriod,
    votingPeriods,
    isLoading,
    error,
    setError,
    fetchData
  };
};