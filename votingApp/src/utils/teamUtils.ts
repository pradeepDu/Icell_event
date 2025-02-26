// teamUtils.ts
import { TeamMember, Team } from './student';

export const processTeamData = (teamMembers: TeamMember[]): Team[] => {
  // Filter visible members
  const visibleMembers = teamMembers.filter(member => 
    !member.isHidden && 
    !member.name.includes("Team Created") && 
    member.post !== "Administrative Entry"
  );
  
  // Group by team name
  const teamData: Record<string, TeamMember[]> = visibleMembers.reduce((acc, member) => {
    if (!acc[member.teamName]) {
      acc[member.teamName] = [];
    }
    acc[member.teamName].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);
  
  // Get all unique team names
  const allTeamNames = [...new Set(teamMembers.map(member => member.teamName))];
  
  // Create team objects
  return allTeamNames.map(teamName => ({
    name: teamName,
    members: teamData[teamName] || [],
    leader: (teamData[teamName] || []).find(member => member.isLeader) || null,
  }));
};

export const getTeamColor = (teamName: string): string => {
  const colors = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-info text-info-content",
    "bg-success text-success-content",
    "bg-warning text-warning-content"
  ];
  
  const sum = teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};