// Shared types for the Admin Dashboard

export interface TeamMember {
    _id: string;
    name: string;
    post: string;
    teamName: string;
    isLeader: boolean;
    isHidden?: boolean;
  }
  
  export interface VoteStats {
    teamName: string;
    votes: number;
  }
  
  export interface VotingPeriod {
    _id: string;
    startDate: string;
    endDate: string;
    active: boolean;
    name: string;
  }
  
  export interface NewMember {
    name: string;
    post: string;
    teamName: string;
    isLeader: boolean;
  }
  
  export interface NewVotingPeriod {
    name: string;
    endDate: string;
  }
  
  export interface StatusMessage {
    error: string;
    success: string;
  }