// StudentDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Components
import UserProfile from '../components/Student/UserProfile';
import ErrorAlert from '../components/Student/ErrorAlert';
import LoadingSkeleton from '../components/Student/LoadingSkeleton';
import TeamGrid from '../components/Student/TeamGrid';

// Services and utilities
import { fetchUserVote, fetchTeamMembers, submitVote as apiSubmitVote, resetVote as apiResetVote } from '../utils/teamService';
import { processTeamData } from '../utils/teamUtils';
import { setupDashboardAnimations, animateVoteSuccess, animateResetVote } from '../components/Student/ui/animation';
import { Team } from '.././utils/student';
const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const studentEmail = currentUser?.email || '';
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [votedTeam, setVotedTeam] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Refs for GSAP animations
  const dashboardRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);
  const teamCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!studentEmail) return;
    
    // Fetch teams data and user vote
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch teams
        const teamMembersData = await fetchTeamMembers();
        const processedTeams = processTeamData(teamMembersData);
        setTeams(processedTeams);
        
        // Check if user has voted
        const voteData = await fetchUserVote(studentEmail);
        if (voteData) {
          setVotedTeam(voteData.teamName);
          setHasVoted(true);
        } else {
          setHasVoted(false);
          setVotedTeam(null);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [studentEmail]);

  // Setup animations after data loads
  useEffect(() => {
    if (!isLoading) {
      setupDashboardAnimations(dashboardRef.current, teamCardsRef.current);
    }
  }, [isLoading, teams]);

  const submitVote = async (teamName: string) => {
    try {
      await apiSubmitVote(studentEmail, teamName);
      setVotedTeam(teamName);
      setHasVoted(true);
      
      // Animate the vote success notification
      const teamIndex = teams.findIndex(team => team.name === teamName);
      if (teamIndex !== -1) {
        animateVoteSuccess(teamCardsRef.current[teamIndex]);
      }
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError('Failed to submit your vote');
    }
  };

  const resetVote = async () => {
    try {
      await apiResetVote(studentEmail);
      setVotedTeam(null);
      setHasVoted(false);
      
      // Animate all team cards
      animateResetVote(teamCardsRef.current);
    } catch (err) {
      console.error("Error resetting vote:", err);
      setError('Failed to reset your vote');
    }
  };

  const setTeamCardRef = (index: number) => (el: HTMLDivElement | null) => {
    teamCardsRef.current[index] = el;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto">
      <div ref={dashboardRef}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-center text-primary">
          Student Voting Dashboard
        </h1>
        
        <ErrorAlert error={error} onClose={() => setError('')} />
        
        <UserProfile
          studentEmail={studentEmail}
          hasVoted={hasVoted}
          votedTeam={votedTeam}
          resetVote={resetVote}
          error={error}
          setError={setError}
        />
      </div>
      
      <TeamGrid
        teams={teams}
        hasVoted={hasVoted}
        votedTeam={votedTeam}
        submitVote={submitVote}
        teamsRef={teamsRef}
        setTeamCardRef={setTeamCardRef}
      />
    </div>
  );
};

export default StudentDashboard;