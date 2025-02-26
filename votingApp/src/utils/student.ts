// types.ts
export interface TeamMember {
    _id: string;
    name: string;
    post: string;
    teamName: string;
    isLeader: boolean;
    isHidden?: boolean;
  }
  
  export interface Team {
    name: string;
    members: TeamMember[];
    leader: TeamMember | null;
  }
  
  export interface Vote {
    userId: string;
    teamName: string;
    votedAt: string;
  }