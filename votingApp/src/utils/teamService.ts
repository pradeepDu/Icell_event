// teamService.ts
import axios from 'axios';
import { TeamMember, Vote } from './student';

export const fetchUserVote = async (studentEmail: string): Promise<Vote | null> => {
  try {
    const response = await axios.get<Vote>(`/votes/user/${studentEmail}`);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const response = await axios.get<TeamMember[]>('/team-members');
  return response.data;
};

export const submitVote = async (userId: string, teamName: string): Promise<void> => {
  await axios.post('/votes', { userId, teamName });
};

export const resetVote = async (userId: string): Promise<void> => {
  await axios.delete(`/votes/${userId}`);
};